import Ionicons from '@expo/vector-icons/Ionicons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { uploadMediaToCloudinary } from '@/services/cloudinary';
import { auth, db } from '@/services/firebase';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FeedVideo = ({
  uri,
  style,
}: {
  uri: string;
  style: any;
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls
    />
  );
};

type FeedRole = 'customer' | 'provider' | 'owner' | string;

type FeedTab = 'my' | 'global';

type FeedPost = {
  id: string;
  authorUid?: string;

  authorName: string;
  authorPhone?: string;
  authorRole: FeedRole;

  text: string;

  mediaUrl?: string;
  mediaType?: 'image' | 'video' | null;

  likeCount: number;
  dislikeCount: number;
  commentCount: number;

  createdAt?: any;
};

type CommentItem = {
  id: string;
  uid?: string;
  userName: string;
  userPhone?: string;
  text: string;
  createdAt?: any;
};

type Props = {
  userRole?: FeedRole;

  authName?: string;
  authPhone?: string;
  displayName?: string;

  canCreatePost?: boolean;
  canComment?: boolean;
};

const timeAgo = (timestamp: any) => {
  const date =
    timestamp?.toDate?.() instanceof Date
      ? timestamp.toDate()
      : timestamp instanceof Date
        ? timestamp
        : null;

  if (!date) return 'Just now';

  const seconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d`;

  return date.toLocaleDateString();
};

const safeRoleLabel = (role?: string) => {
  if (role === 'provider' || role === 'owner') return 'Owner';

  return 'Customer';
};

export default function SocialFeed({
  userRole = 'customer',
  authName = '',
  authPhone = '',
  displayName = '',
  canCreatePost = false,
  canComment = true,
}: Props) {
  const [posts, setPosts] = useState<FeedPost[]>([]);

  const [loading, setLoading] = useState(true);

  const [feedTab, setFeedTab] = useState<FeedTab>('global');

  const [composerOpen, setComposerOpen] = useState(false);

  const [postText, setPostText] = useState('');

  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
  } | null>(null);

  const [posting, setPosting] = useState(false);

  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);

  const [editText, setEditText] = useState('');

  const [editing, setEditing] = useState(false);

  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentText, setCommentText] = useState('');

  const [commentPosting, setCommentPosting] = useState(false);

  const uid = auth.currentUser?.uid || 'anonymous';

  const name = displayName || authName || 'User';

  /*
   * Provider/Owner feed gets MY POST + GLOBAL POST.
   * Customer feed behaviour remains global by default.
   */
  const showFeedTabs =
    userRole === 'provider' || userRole === 'owner';

  // ============================================================
  // LOAD ALL POSTS
  // ============================================================

  useEffect(() => {
    const postsQuery = query(
      collection(db, 'feedPosts'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      postsQuery,
      snapshot => {
        const loadedPosts: FeedPost[] = snapshot.docs.map(item => ({
          id: item.id,
          ...(item.data() as Omit<FeedPost, 'id'>),
        }));

        setPosts(loadedPosts);
        setLoading(false);
      },
      error => {
        console.error('Feed listener error:', error);
        setLoading(false);
      }
    );
  }, []);

  // ============================================================
  // FILTER FEED
  // ============================================================

  const visiblePosts = useMemo(() => {
    if (!showFeedTabs) {
      return posts;
    }

    if (feedTab === 'my') {
      return posts.filter(post => post.authorUid === uid);
    }

    return posts;
  }, [posts, feedTab, uid, showFeedTabs]);

  // ============================================================
  // PICK MEDIA
  // ============================================================

  const pickMedia = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission allow karein taaki photo/video select ho sake.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 0.85,
          videoMaxDuration: 60,
        });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      const mediaType =
        asset.type === 'video' ||
        asset.mimeType?.startsWith('video/')
          ? 'video'
          : 'image';

      setSelectedMedia({
        uri: asset.uri,
        type: mediaType,
      });
    } catch (error: any) {
      Alert.alert(
        'Media Error',
        error?.message || 'Media select nahi ho saka.'
      );
    }
  };

  // ============================================================
  // CREATE POST
  // ============================================================

  const createPost = async () => {
    const text = postText.trim();

    if (!text && !selectedMedia) {
      Alert.alert(
        'Empty Post',
        'Text ya photo/video me se kuch add karein.'
      );

      return;
    }

    if (!auth.currentUser) {
      Alert.alert(
        'Login Required',
        'Pehle account create/login karein.'
      );

      return;
    }

    setPosting(true);

    try {
      let mediaUrl = '';
      let mediaType: 'image' | 'video' | null = null;

      if (selectedMedia) {
        mediaType = selectedMedia.type;

        mediaUrl = await uploadMediaToCloudinary(
          selectedMedia.uri,
          selectedMedia.type
        );
      }

      await addDoc(collection(db, 'feedPosts'), {
        authorUid: uid,

        authorName: name,

        authorPhone: authPhone || '',

        authorRole: userRole || 'customer',

        text,

        mediaUrl,

        mediaType,

        likeCount: 0,

        dislikeCount: 0,

        commentCount: 0,

        createdAt: serverTimestamp(),
      });

      setPostText('');

      setSelectedMedia(null);

      setComposerOpen(false);

      setFeedTab('my');
    } catch (error: any) {
      console.error('Create feed post error:', error);

      Alert.alert(
        'Post Failed',
        error?.message || 'Post upload nahi ho saka.'
      );
    } finally {
      setPosting(false);
    }
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEditPost = (post: FeedPost) => {
    if (post.authorUid !== uid) {
      return;
    }

    setEditingPost(post);

    setEditText(post.text || '');
  };

  // ============================================================
  // UPDATE POST
  // ============================================================

  const updatePost = async () => {
    if (!editingPost || !auth.currentUser) {
      return;
    }

    if (editingPost.authorUid !== uid) {
      Alert.alert(
        'Not Allowed',
        'Sirf apne post ko edit kar sakte hain.'
      );

      return;
    }

    const text = editText.trim();

    if (!text && !editingPost.mediaUrl) {
      Alert.alert(
        'Empty Post',
        'Post completely empty nahi ho sakta.'
      );

      return;
    }

    setEditing(true);

    try {
      const postRef = doc(
        db,
        'feedPosts',
        editingPost.id
      );

      /*
       * Re-check ownership from Firestore before update.
       * This prevents accidental editing of another user's post.
       */
      const snapshot = await getDoc(postRef);

      if (!snapshot.exists()) {
        Alert.alert(
          'Post Not Found',
          'Ye post ab available nahi hai.'
        );

        setEditingPost(null);

        return;
      }

      const existingData = snapshot.data();

      if (existingData.authorUid !== uid) {
        Alert.alert(
          'Not Allowed',
          'Sirf apne post ko edit kar sakte hain.'
        );

        setEditingPost(null);

        return;
      }

      await updateDoc(postRef, {
        text,

        updatedAt: serverTimestamp(),
      });

      setEditingPost(null);

      setEditText('');
    } catch (error: any) {
      console.error('Edit feed post error:', error);

      Alert.alert(
        'Edit Failed',
        error?.message || 'Post update nahi ho saka.'
      );
    } finally {
      setEditing(false);
    }
  };

  // ============================================================
  // DELETE POST
  // ============================================================

  const deletePost = (post: FeedPost) => {
    if (post.authorUid !== uid) {
      Alert.alert(
        'Not Allowed',
        'Sirf apne post ko delete kar sakte hain.'
      );

      return;
    }

    Alert.alert(
      'Delete Post',
      'Kya aap ye post permanently delete karna chahte hain?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const postRef = doc(
                db,
                'feedPosts',
                post.id
              );

              /*
               * Re-check ownership.
               */
              const snapshot = await getDoc(postRef);

              if (!snapshot.exists()) {
                Alert.alert(
                  'Post Not Found',
                  'Ye post already delete ho chuka hai.'
                );

                return;
              }

              if (snapshot.data()?.authorUid !== uid) {
                Alert.alert(
                  'Not Allowed',
                  'Sirf apne post ko delete kar sakte hain.'
                );

                return;
              }

              await deleteDoc(postRef);
            } catch (error: any) {
              console.error(
                'Delete feed post error:',
                error
              );

              Alert.alert(
                'Delete Failed',
                error?.message ||
                  'Post delete nahi ho saka.'
              );
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // POST OPTIONS
  // ============================================================

  const openPostOptions = (post: FeedPost) => {
    const isMyPost = post.authorUid === uid;

    if (!isMyPost) {
      return;
    }

    Alert.alert(
      'Post Options',
      undefined,
      [
        {
          text: 'Edit',
          onPress: () => openEditPost(post),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePost(post),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // ============================================================
  // REACTION
  // ============================================================

  const reactToPost = async (
    post: FeedPost,
    reaction: 'like' | 'dislike'
  ) => {
    if (!auth.currentUser) {
      return;
    }

    const reactionRef = doc(
      db,
      'feedPosts',
      post.id,
      'reactions',
      uid
    );

    try {
      const reactionSnap = await getDoc(
        reactionRef
      );

      const previous = reactionSnap.exists()
        ? reactionSnap.data()?.type
        : null;

      const postRef = doc(
        db,
        'feedPosts',
        post.id
      );

      if (previous === reaction) {
        await deleteDoc(reactionRef);

        await updateDoc(postRef, {
          [`${reaction}Count`]: increment(-1),
        });

        return;
      }

      if (previous === 'like') {
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      }

      if (previous === 'dislike') {
        await updateDoc(postRef, {
          dislikeCount: increment(-1),
        });
      }

      await setDoc(reactionRef, {
        type: reaction,

        uid,

        updatedAt: serverTimestamp(),
      });

      await updateDoc(postRef, {
        [`${reaction}Count`]: increment(1),
      });
    } catch (error) {
      console.error(
        'Reaction error:',
        error
      );
    }
  };

  // ============================================================
  // COMMENTS
  // ============================================================

  const openComments = (post: FeedPost) => {
    setCommentPost(post);

    setCommentText('');

    setComments([]);

    setCommentsLoading(true);

    const commentsQuery = query(
      collection(
        db,
        'feedPosts',
        post.id,
        'comments'
      ),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      snapshot => {
        setComments(
          snapshot.docs.map(item => ({
            id: item.id,

            ...(item.data() as Omit<
              CommentItem,
              'id'
            >),
          }))
        );

        setCommentsLoading(false);
      },
      error => {
        console.error(
          'Comments listener error:',
          error
        );

        setCommentsLoading(false);
      }
    );

    (post as any).__commentsUnsubscribe =
      unsubscribe;
  };

  const closeComments = () => {
    const unsubscribe =
      (commentPost as any)
        ?.__commentsUnsubscribe;

    if (unsubscribe) {
      unsubscribe();
    }

    setCommentPost(null);

    setComments([]);

    setCommentText('');
  };

  const addComment = async () => {
    const text = commentText.trim();

    if (
      !text ||
      !commentPost ||
      !auth.currentUser
    ) {
      return;
    }

    if (!canComment) {
      return;
    }

    setCommentPosting(true);

    try {
      await addDoc(
        collection(
          db,
          'feedPosts',
          commentPost.id,
          'comments'
        ),
        {
          uid,

          userName: name,

          userPhone: authPhone || '',

          text,

          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(
          db,
          'feedPosts',
          commentPost.id
        ),
        {
          commentCount: increment(1),
        }
      );

      setCommentText('');
    } catch (error: any) {
      console.error(
        'Comment error:',
        error
      );

      Alert.alert(
        'Comment Failed',
        error?.message ||
          'Comment add nahi ho saka.'
      );
    } finally {
      setCommentPosting(false);
    }
  };

  // ============================================================
  // RENDER POST
  // ============================================================

  const renderPost = ({
    item,
  }: {
    item: FeedPost;
  }) => {
    const isOwner =
      item.authorRole === 'provider' ||
      item.authorRole === 'owner';

    const isMyPost =
      item.authorUid === uid;

    return (
      <View style={styles.postCard}>
        {/* HEADER */}

        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Ionicons
              name={
                isOwner
                  ? 'storefront'
                  : 'person'
              }
              size={20}
              color="#4f46e5"
            />
          </View>

          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {item.authorName || 'User'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.roleBadge}>
                <Text
                  style={
                    styles.roleBadgeText
                  }
                >
                  {safeRoleLabel(
                    item.authorRole
                  )}
                </Text>
              </View>

              <Text style={styles.timeText}>
                {timeAgo(
                  item.createdAt
                )}
              </Text>
            </View>
          </View>

          {isMyPost ? (
            <Pressable
              style={styles.moreButton}
              onPress={() =>
                openPostOptions(item)
              }
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={21}
                color="#64748b"
              />
            </Pressable>
          ) : null}
        </View>

        {/* TEXT */}

        {!!item.text && (
          <Text style={styles.postText}>
            {item.text}
          </Text>
        )}

        {/* MEDIA */}

        {!!item.mediaUrl &&
          item.mediaType ===
            'image' && (
            <Image
              source={{
                uri: item.mediaUrl,
              }}
              style={styles.postMedia}
              resizeMode="cover"
            />
          )}

        {!!item.mediaUrl &&
          item.mediaType ===
            'video' && (
            <FeedVideo
              uri={item.mediaUrl}
              style={styles.postMedia}
            />
          )}

        {/* COUNTS */}

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {item.likeCount || 0} likes
          </Text>

          <Text style={styles.countText}>
            {item.dislikeCount || 0}{' '}
            dislikes
          </Text>

          <Pressable
            onPress={() =>
              openComments(item)
            }
          >
            <Text style={styles.countText}>
              {item.commentCount || 0}{' '}
              comments
            </Text>
          </Pressable>
        </View>

        {/* ACTION BAR */}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              reactToPost(
                item,
                'like'
              )
            }
          >
            <Ionicons
              name="thumbs-up-outline"
              size={21}
              color="#2563eb"
            />

            <Text
              style={styles.actionText}
            >
              Like
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              reactToPost(
                item,
                'dislike'
              )
            }
          >
            <Ionicons
              name="thumbs-down-outline"
              size={21}
              color="#ef4444"
            />

            <Text
              style={styles.actionText}
            >
              Dislike
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              openComments(item)
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color="#475569"
            />

            <Text
              style={styles.actionText}
            >
              Comment
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const emptyText = useMemo(() => {
    if (showFeedTabs && feedTab === 'my') {
      return 'Aapne abhi koi post nahi kiya.';
    }

    return 'Abhi feed me koi post nahi hai.';
  }, [feedTab, showFeedTabs]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <View style={styles.container}>
      {/* FEED HEADER */}

      <View style={styles.feedHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.feedTitle}>
            Community Feed
          </Text>

          <Text
            style={styles.feedSubtitle}
          >
            Customer aur Owner ke posts
          </Text>
        </View>

        {canCreatePost && (
          <Pressable
            style={styles.createButton}
            onPress={() =>
              setComposerOpen(true)
            }
          >
            <Ionicons
              name="add"
              size={20}
              color="#fff"
            />

            <Text
              style={
                styles.createButtonText
              }
            >
              Post
            </Text>
          </Pressable>
        )}
      </View>

      {/* MY POST / GLOBAL POST */}

      {showFeedTabs && (
        <View style={styles.feedTabsContainer}>
          <Pressable
            style={[
              styles.feedTab,
              feedTab === 'my' &&
                styles.activeFeedTab,
            ]}
            onPress={() =>
              setFeedTab('my')
            }
          >
            <Ionicons
              name="person-outline"
              size={17}
              color={
                feedTab === 'my'
                  ? '#4f46e5'
                  : '#64748b'
              }
            />

            <Text
              style={[
                styles.feedTabText,
                feedTab === 'my' &&
                  styles.activeFeedTabText,
              ]}
            >
              MY POST
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.feedTab,
              feedTab === 'global' &&
                styles.activeFeedTab,
            ]}
            onPress={() =>
              setFeedTab('global')
            }
          >
            <Ionicons
              name="globe-outline"
              size={17}
              color={
                feedTab === 'global'
                  ? '#4f46e5'
                  : '#64748b'
              }
            />

            <Text
              style={[
                styles.feedTabText,
                feedTab === 'global' &&
                  styles.activeFeedTabText,
              ]}
            >
              GLOBAL POST
            </Text>
          </Pressable>
        </View>
      )}

      {/* POSTS */}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#4f46e5"
          />

          <Text
            style={styles.loadingText}
          >
            Feed load ho rahi hai...
          </Text>
        </View>
      ) : (
        <FlatList
          data={visiblePosts}
          keyExtractor={item =>
            item.id
          }
          renderItem={renderPost}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            visiblePosts.length
              ? styles.listContent
              : styles.emptyContent
          }
          ListEmptyComponent={
            <View
              style={styles.emptyBox}
            >
              <Ionicons
                name="newspaper-outline"
                size={52}
                color="#cbd5e1"
              />

              <Text
                style={styles.emptyTitle}
              >
                No Posts Yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                {emptyText}
              </Text>
            </View>
          }
        />
      )}

      {/* ======================================================
          CREATE POST MODAL
          ====================================================== */}

      <Modal
        visible={composerOpen}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setComposerOpen(false)
        }
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={styles.composer}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Create Post
              </Text>

              <Pressable
                onPress={() => {
                  if (!posting) {
                    setComposerOpen(
                      false
                    );

                    setSelectedMedia(
                      null
                    );

                    setPostText('');
                  }
                }}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#334155"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.composerAuthor
              }
            >
              <View
                style={
                  styles.smallAvatar
                }
              >
                <Ionicons
                  name={
                    userRole ===
                      'provider' ||
                    userRole === 'owner'
                      ? 'storefront'
                      : 'person'
                  }
                  size={18}
                  color="#4f46e5"
                />
              </View>

              <View>
                <Text
                  style={
                    styles.composerName
                  }
                >
                  {name}
                </Text>

                <Text
                  style={
                    styles.composerRole
                  }
                >
                  {safeRoleLabel(
                    userRole
                  )}
                </Text>
              </View>
            </View>

            <TextInput
              value={postText}
              onChangeText={setPostText}
              placeholder="Kuch share karein..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              style={styles.composerInput}
              editable={!posting}
            />

            {!!selectedMedia && (
              <View
                style={styles.previewBox}
              >
                {selectedMedia.type ===
                'image' ? (
                  <Image
                    source={{
                      uri: selectedMedia.uri,
                    }}
                    style={
                      styles.previewMedia
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <FeedVideo
                    uri={selectedMedia.uri}
                    style={styles.previewMedia}
                  />
                )}

                <Pressable
                  style={
                    styles.removeMedia
                  }
                  onPress={() =>
                    setSelectedMedia(
                      null
                    )
                  }
                  disabled={posting}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color="#fff"
                  />
                </Pressable>
              </View>
            )}

            <Pressable
              style={styles.mediaButton}
              onPress={pickMedia}
              disabled={posting}
            >
              <Ionicons
                name="images-outline"
                size={22}
                color="#4f46e5"
              />

              <Text
                style={
                  styles.mediaButtonText
                }
              >
                Photo / Video Add Karein
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.publishButton,
                posting &&
                  styles.publishButtonDisabled,
              ]}
              onPress={createPost}
              disabled={posting}
            >
              {posting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={18}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.publishText
                    }
                  >
                    Publish Post
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================
          EDIT POST MODAL
          ====================================================== */}

      <Modal
        visible={!!editingPost}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!editing) {
            setEditingPost(null);
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={styles.composer}
          >
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Edit Post
              </Text>

              <Pressable
                onPress={() => {
                  if (!editing) {
                    setEditingPost(
                      null
                    );

                    setEditText('');
                  }
                }}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#334155"
                />
              </Pressable>
            </View>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Post text..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              style={styles.composerInput}
              editable={!editing}
            />

            {!!editingPost?.mediaUrl && (
              <View
                style={
                  styles.existingMediaBox
                }
              >
                {editingPost.mediaType ===
                'image' ? (
                  <Image
                    source={{
                      uri: editingPost.mediaUrl,
                    }}
                    style={
                      styles.previewMedia
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <FeedVideo
                    uri={editingPost.mediaUrl}
                    style={styles.previewMedia}
                  />
                )}

                <View
                  style={
                    styles.existingMediaLabel
                  }
                >
                  <Text
                    style={
                      styles.existingMediaLabelText
                    }
                  >
                    Existing media
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              style={[
                styles.publishButton,
                editing &&
                  styles.publishButtonDisabled,
              ]}
              onPress={updatePost}
              disabled={editing}
            >
              {editing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={19}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.publishText
                    }
                  >
                    Save Changes
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================
          COMMENTS MODAL
          ====================================================== */}

      <Modal
        visible={!!commentPost}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={styles.commentsModal}
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={styles.modalTitle}
                >
                  Comments
                </Text>

                <Text
                  style={
                    styles.commentSubtitle
                  }
                >
                  {commentPost?.commentCount ||
                    0}{' '}
                  comments
                </Text>
              </View>

              <Pressable
                onPress={closeComments}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#334155"
                />
              </Pressable>
            </View>

            {commentsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator
                  size="small"
                  color="#4f46e5"
                />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={item =>
                  item.id
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.commentsList
                }
                ListEmptyComponent={
                  <View
                    style={
                      styles.noComments
                    }
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={40}
                      color="#cbd5e1"
                    />

                    <Text
                      style={
                        styles.noCommentsText
                      }
                    >
                      Abhi koi comment
                      nahi hai.
                    </Text>
                  </View>
                }
                renderItem={({
                  item,
                }) => (
                  <View
                    style={
                      styles.commentRow
                    }
                  >
                    <View
                      style={
                        styles.commentAvatar
                      }
                    >
                      <Ionicons
                        name="person"
                        size={15}
                        color="#4f46e5"
                      />
                    </View>

                    <View
                      style={
                        styles.commentBubble
                      }
                    >
                      <Text
                        style={
                          styles.commentUser
                        }
                      >
                        {item.userName ||
                          'User'}
                      </Text>

                      <Text
                        style={
                          styles.commentBody
                        }
                      >
                        {item.text}
                      </Text>

                      <Text
                        style={
                          styles.commentTime
                        }
                      >
                        {timeAgo(
                          item.createdAt
                        )}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}

            <View
              style={
                styles.commentInputRow
              }
            >
              <TextInput
                value={commentText}
                onChangeText={
                  setCommentText
                }
                placeholder="Comment likhein..."
                placeholderTextColor="#94a3b8"
                style={
                  styles.commentInput
                }
                multiline
                editable={!commentPosting}
              />

              <Pressable
                style={[
                  styles.sendCommentButton,
                  commentPosting &&
                    styles.publishButtonDisabled,
                ]}
                onPress={addComment}
                disabled={
                  commentPosting
                }
              >
                {commentPosting ? (
                  <ActivityIndicator
                    color="#fff"
                    size="small"
                  />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color="#fff"
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  feedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  feedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  feedSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748b',
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  feedTabsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  feedTab: {
    flex: 1,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeFeedTab: {
    borderBottomColor: '#4f46e5',
  },

  feedTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },

  activeFeedTabText: {
    color: '#4f46e5',
  },

  listContent: {
    padding: 10,
    paddingBottom: 35,
  },

  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },

  postCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },

  authorName: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 7,
  },

  roleBadge: {
    backgroundColor: '#eef2ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  roleBadgeText: {
    color: '#4f46e5',
    fontSize: 9,
    fontWeight: '800',
  },

  timeText: {
    color: '#94a3b8',
    fontSize: 10,
  },

  moreButton: {
    padding: 7,
  },

  postText: {
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 13,
    paddingBottom: 13,
  },

  postMedia: {
    width: SCREEN_WIDTH - 22,
    height: Math.min(
      (SCREEN_WIDTH - 22) * 0.72,
      430
    ),
    backgroundColor: '#0f172a',
  },

  countRow: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    paddingVertical: 9,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  countText: {
    color: '#64748b',
    fontSize: 11,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  actionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: '#334155',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.48)',
    justifyContent: 'flex-end',
  },

  composer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    maxHeight: '92%',
  },

  commentsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: '82%',
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  modalTitle: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '800',
  },

  commentSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },

  composerAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  composerName: {
    marginLeft: 9,
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },

  composerRole: {
    marginLeft: 9,
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },

  composerInput: {
    minHeight: 105,
    maxHeight: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    color: '#0f172a',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },

  previewBox: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },

  existingMediaBox: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },

  existingMediaLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  existingMediaLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  previewMedia: {
    width: '100%',
    height: 210,
  },

  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mediaButton: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },

  mediaButtonText: {
    color: '#4338ca',
    fontSize: 12,
    fontWeight: '800',
  },

  publishButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  publishButtonDisabled: {
    opacity: 0.65,
  },

  publishText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  commentsList: {
    paddingVertical: 6,
    paddingBottom: 20,
  },

  commentRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  commentBubble: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 9,
  },

  commentUser: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '800',
  },

  commentBody: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  commentTime: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 4,
  },

  noComments: {
    alignItems: 'center',
    paddingTop: 50,
  },

  noCommentsText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },

  commentInput: {
    flex: 1,
    maxHeight: 90,
    minHeight: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 11,
    color: '#0f172a',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sendCommentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});