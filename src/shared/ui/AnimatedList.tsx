import React from 'react';
import { FlatList, FlatListProps, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[] | null | undefined;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  animationDelay?: number;
  itemContainerStyle?: StyleProp<ViewStyle>;
}

export function AnimatedList<T>(props: AnimatedListProps<T>) {
  const { data, renderItem, animationDelay = 50, itemContainerStyle, ...rest } = props;

  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as any;

  return (
    <AnimatedFlatList
      data={data}
      renderItem={(info: { item: T; index: number }) => (
        <Animated.View
          entering={FadeInDown.delay(info.index * animationDelay).springify()}
          style={itemContainerStyle}
        >
          {renderItem(info)}
        </Animated.View>
      )}
      {...rest}
    />
  );
}
