import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type LinkProps = ComponentProps<typeof Link>;

export function ExternalLink(
  props: Omit<LinkProps, 'href'> & { href: string }
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href as LinkProps['href']}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          e.preventDefault();

          WebBrowser.openBrowserAsync(props.href);
        }
      }}
    />
  );
}
