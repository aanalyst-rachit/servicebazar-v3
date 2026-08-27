import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '@/context/AppContext';
import { callback } from 'react-native-nitro-modules';
import {
  RtmpPublisherView,
  requestRtmpPermissions,
  type RtmpPublisherViewMethods,
} from 'react-native-nitro-rtmp-publisher';
import {
  getCoachingPremiumLive,
  saveCoachingPremiumLive,
  type CoachingPremiumLiveStream,
} from '../coachingTeacherService';

type Props = {
  backendUrl: string;
  onBack?: () => void;
};

type StreamData = {
  id: string | null;
  name: string | null;
  isActive: boolean;
  playbackId: string | null;
  ingestUrl: string | null;
  streamKey: string | null;
};

export default function PremiumLivePlayerScreen({
  backendUrl,
  onBack,
}: Props) {
  const { firebaseUid, ownerName, shopName } = useApp();

  const [savedStream, setSavedStream] =
    useState<CoachingPremiumLiveStream | null>(null);

  const [stream, setStream] =
    useState<StreamData | null>(null);

  const publisher =
    useRef<RtmpPublisherViewMethods | null>(null);

  const [permissionsReady, setPermissionsReady] =
    useState(false);

  const [isBroadcasting, setIsBroadcasting] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [showLiveClassDetails, setShowLiveClassDetails] =
    useState(false);

  // Premium Live onBack handler
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (onBack) {
          onBack();
          return true;
        }

        return false;
      }
    );

    return () => subscription.remove();
  }, [onBack]);

  const hybridRef = useMemo(
    () =>
      callback((ref: RtmpPublisherViewMethods) => {
        publisher.current = ref;

        try {
          const rotation = ref.getCameraOrientation();

          ref.prepareVideo(
            1280,
            720,
            30,
            2_500_000,
            2,
            rotation
          );

          ref.prepareAudio(
            128_000,
            44_100,
            true
          );

          ref.startPreview(
            'back',
            1280,
            720
          );

          ref.setAutoReconnect(5, 3000);

          ref.setOnConnectionEvent(
            (event, message) => {
              console.log(
                'Premium RTMP:',
                event,
                message
              );

              if (event === 'connectionSuccess') {
                setIsBroadcasting(true);
              }

              if (
                event === 'disconnect' ||
                event === 'connectionFailed'
              ) {
                setIsBroadcasting(false);
              }
            }
          );
        } catch (err) {
          console.error(
            'RTMP publisher setup error:',
            err
          );
        }
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    requestRtmpPermissions()
      .then(({ granted }) => {
        if (!mounted) return;

        setPermissionsReady(granted);

        if (!granted) {
          Alert.alert(
            'Permissions required',
            'Camera and microphone permissions are required for Premium Live broadcasting.'
          );
        }
      })
      .catch((err) => {
        console.error(
          'RTMP permission error:',
          err
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const teacherName =
    ownerName || 'Teacher';

  const streamName =
    shopName
      ? `${shopName} Premium Live Class`
      : `${teacherName} Premium Live Class`;

  const loadStreamStatus = async (
    streamId: string,
    playbackId?: string
  ) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/livepeer/stream/${encodeURIComponent(
          streamId
        )}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.stream
      ) {
        if (response.status === 401) {
          console.warn(
            'Premium Live: saved Livepeer stream is no longer accessible.'
          );

          setStream(null);
          setSavedStream(null);
          return;
        }

        throw new Error(
          data.message ||
            'Unable to load Livepeer stream.'
        );
      }

      setStream(data.stream);

      const resolvedPlaybackId =
        data.stream.playbackId ||
        playbackId;
    } catch (err) {
      console.error(
        'Livepeer status error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load live stream status.'
      );
    }
  };

  const createStream = async () => {
    if (!firebaseUid) {
      setError(
        'Teacher authentication not found. Please login again.'
      );
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch(
        `${backendUrl}/api/livepeer/create-stream?name=${encodeURIComponent(
          streamName
        )}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.stream
      ) {
        throw new Error(
          data.message ||
            'Unable to create Livepeer stream.'
        );
      }

      const created = data.stream;

      if (
        !created.id ||
        !created.playbackId
      ) {
        throw new Error(
          'Livepeer did not return a valid stream.'
        );
      }

      const premiumLive: CoachingPremiumLiveStream = {
        streamId: created.id,
        streamKey: created.streamKey || '',
        playbackId: created.playbackId,
        ingestUrl:
          created.ingestUrl ||
          'rtmp://rtmp.livepeer.com/live',
        streamName:
          created.name || streamName,
      };

      await saveCoachingPremiumLive(
        firebaseUid,
        premiumLive
      );

      setSavedStream(premiumLive);

      setStream({
        id: premiumLive.streamId,
        name: premiumLive.streamName,
        isActive: false,
        playbackId: premiumLive.playbackId,
        ingestUrl: premiumLive.ingestUrl,
        streamKey: premiumLive.streamKey,
      });
      await loadStreamStatus(
        premiumLive.streamId,
        premiumLive.playbackId
      );
    } catch (err) {
      console.error(
        'Livepeer create stream error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create premium live stream.'
      );
    } finally {
      setCreating(false);
    }
  };

  const startBroadcast = () => {
    if (!permissionsReady) {
      Alert.alert(
        'Permissions required',
        'Please allow camera and microphone permissions first.'
      );
      return;
    }

    if (!savedStream?.streamKey) {
      setError(
        'This Premium Live stream has no stream key. Create a new stream.'
      );
      return;
    }

    if (!savedStream.ingestUrl) {
      setError(
        'Livepeer ingest URL is unavailable.'
      );
      return;
    }

    try {
      setError(null);

      const ingestUrl =
        savedStream.ingestUrl.replace(/\/$/, '');

      const rtmpUrl =
        `${ingestUrl}/${savedStream.streamKey}`;

      console.log(
        'Starting Premium Live RTMP broadcast'
      );

      publisher.current?.startStream(rtmpUrl);
    } catch (err) {
      console.error(
        'Premium RTMP start error:',
        err
      );

      setIsBroadcasting(false);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start Premium Live broadcast.'
      );
    }
  };

  const stopBroadcast = () => {
    try {
      publisher.current?.stopStream();
      setIsBroadcasting(false);
    } catch (err) {
      console.error(
        'Premium RTMP stop error:',
        err
      );
    }
  };

  const initialize = async () => {
    if (!firebaseUid) {
      setError(
        'Teacher authentication not found. Please login again.'
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const existing =
        await getCoachingPremiumLive(
          firebaseUid
        );

      if (existing) {
        setSavedStream(existing);

        setStream({
          id: existing.streamId,
          name: existing.streamName,
          isActive: false,
          playbackId: existing.playbackId,
          ingestUrl: existing.ingestUrl,
          streamKey: existing.streamKey,
        });

        await loadStreamStatus(
          existing.streamId,
          existing.playbackId
        );

        return;
      }

      setSavedStream(null);
      setStream(null);
    } catch (err) {
      console.error(
        'Premium Live initialization error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize premium live.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [firebaseUid, backendUrl]);

  useEffect(() => {
    if (!savedStream?.streamId) {
      return;
    }

    let active = true;

    const checkStatus = async () => {
      if (!active) {
        return;
      }

      await loadStreamStatus(
        savedStream.streamId,
        savedStream.playbackId
      );
    };

    checkStatus();

    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [savedStream?.streamId]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Premium Live Class
        </Text>

        <Text style={styles.subtitle}>
          Host your premium coaching class using Livepeer.
        </Text>

        <View style={styles.publisherContainer}>
          {permissionsReady ? (
            <RtmpPublisherView
              style={styles.publisher}
              videoCodec="h264"
              audioCodec="aac"
              aspectRatioMode="adjust"
              mirrorPreview={false}
              mirrorStream={false}
              thermalWarningThreshold="severe"
              forceHardwareCodec={false}
              foregroundServiceIcon=""
              pictureInPictureEnabled={false}
              audioSource="camcorder"
              noiseSuppression={false}
              autoRotateStream={true}
              streamMode="balanced"
              foregroundServiceTitle="ServiceBazar Premium Live"
              foregroundServiceText="Premium coaching class is live"
              hybridRef={hybridRef}
            />
          ) : (
            <View style={styles.emptyPlayer}>
              <ActivityIndicator
                size="large"
                color="#ffffff"
              />
              <Text style={styles.emptyText}>
                Preparing camera and microphone...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.broadcastControls}>
          {isBroadcasting ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={stopBroadcast}
              style={styles.stopButton}
            >
              <View style={styles.liveDot} />
              <Text style={styles.stopButtonText}>
                STOP LIVE
              </Text>
            </TouchableOpacity>
          ) : savedStream?.streamKey ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startBroadcast}
              disabled={!permissionsReady}
              style={[
                styles.goLiveButton,
                !permissionsReady &&
                  styles.buttonDisabled,
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.goLiveButtonText}>
                GO LIVE
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={createStream}
              disabled={!permissionsReady || creating}
              style={[
                styles.goLiveButton,
                (!permissionsReady || creating) &&
                  styles.buttonDisabled,
              ]}
            >
              {creating ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <Text style={styles.goLiveButtonText}>
                  CREATE PREMIUM STREAM
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              stream?.isActive
                ? styles.statusLive
                : styles.statusOffline,
            ]}
          />

          <Text style={styles.statusText}>
            {stream?.isActive ? 'ON AIR' : 'OFFLINE'}
          </Text>
        </View>

        {savedStream ? (
          <View style={styles.infoCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setShowLiveClassDetails(
                  previous => !previous
                )
              }
              style={styles.infoHeader}
            >
              <View>
                <Text style={styles.infoTitle}>
                  Your Live Class
                </Text>

                <Text style={styles.infoSummary}>
                  {showLiveClassDetails
                    ? 'Hide stream details'
                    : 'Show stream details'}
                </Text>
              </View>

              <Text style={styles.dropdownArrow}>
                {showLiveClassDetails ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showLiveClassDetails ? (
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>
                  Stream Name
                </Text>

                <Text style={styles.infoValue}>
                  {savedStream.streamName}
                </Text>

                <Text style={styles.infoLabel}>
                  Stream ID
                </Text>

                <Text style={styles.infoValue}>
                  {savedStream.streamId}
                </Text>

                <Text style={styles.infoLabel}>
                  Playback ID
                </Text>

                <Text style={styles.infoValue}>
                  {savedStream.playbackId}
                </Text>

                <Text style={styles.infoLabel}>
                  Ingest URL
                </Text>

                <Text style={styles.infoValue}>
                  {savedStream.ingestUrl}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 18,
    color: '#64748b',
    fontSize: 14,
  },

  publisherContainer: {
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#020617',
    marginBottom: 12,
  },

  publisher: {
    flex: 1,
  },

  broadcastControls: {
    marginBottom: 16,
  },

  goLiveButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  goLiveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },

  stopButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },

  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
  },

  video: {
    width: '100%',
    height: '100%',
  },

  emptyPlayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 10,
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 14,
  },

  statusCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 9,
  },

  statusLive: {
    backgroundColor: '#16a34a',
  },

  statusOffline: {
    backgroundColor: '#94a3b8',
  },

  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },

  infoCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoSummary: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },

  dropdownArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748b',
    marginLeft: 10,
  },

  infoDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },


  infoLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },

  infoValue: {
    marginTop: 3,
    fontSize: 13,
    color: '#0f172a',
  },

  errorText: {
    marginTop: 14,
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 19,
  },

  primaryButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
});
