import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Alert, Pressable } from 'react-native';
import { HouseLine, TrashSimple } from 'phosphor-react-native';
import Animated, { Layout, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';
import { THEME } from '../../styles/theme';

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([]);

  const { goBack } = useNavigation();

  const swipeableRefs = useRef<Swipeable[]>([])

  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string, index: number) {
    swipeableRefs.current?.[index].close();

    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={SlideInRight}
              exiting={SlideOutRight}
              layout={Layout.springify()}
            >
              <Swipeable
                ref={(ref) => {
                  if (ref) {
                    swipeableRefs.current.push(ref)
                  }
                }}
                overshootLeft={false}
                onSwipeableOpen={() => handleRemove(item.id, index)}
                containerStyle={styles.swipeableContainer}
                // Abaixo considera o tamanho pra ele swipar tudo e executar a acao. 
                leftThreshold={10}
                renderRightActions={() => null}
                renderLeftActions={() => (
                  <View style={styles.swipeableRemove}>
                    <TrashSimple size={32} color={THEME.COLORS.GREY_100} />
                  </View>
                  /*    <Pressable
                       style={styles.swipeableRemove}
                       onPress={() => handleRemove(item.id, index)}
                     >
                       <TrashSimple size={32} color={THEME.COLORS.GREY_100} />
                     </Pressable> */
                )}
              >
                <HistoryCard data={item} />
              </Swipeable>
              {/*  <TouchableOpacity
                onPress={() => handleRemove(item.id)}
              >
                <HistoryCard data={item} />
              </TouchableOpacity> */}
            </Animated.View>
          ))
        }
      </ScrollView>
    </View >
  );
}