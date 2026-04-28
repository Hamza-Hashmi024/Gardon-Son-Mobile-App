import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

type Props = TouchableOpacityProps & {
  href: string;
};

export function ExternalLink({ href, children, ...props }: Props) {
  const handlePress = async () => {
    await WebBrowser.openBrowserAsync(href);
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}