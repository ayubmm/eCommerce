/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

export default class Chat extends Component {
  state = {
    chats: [],
  };

  chats() {
    let currentChats = [];
    for (var n = 1; n < 21; n += 1) {
      currentChats.push(
        'chat text...........................................................................................................................................................................',
      );
    }
    this.setState({chats: currentChats});
  }

  componentDidMount() {
    this.chats();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text>Contact Name</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {this.state.chats.map((v, i) => {
            if (i % 2 === 0) {
              return (
                <View style={styles.chatBubbleContainerLeft} key={i}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.chatBubbleLeft}>
                    <Text style={styles.chatText}>{v}</Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              return (
                <View style={styles.chatBubbleContainerRight} key={i}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.chatBubbleRight}>
                    <Text style={styles.chatText}>{v}</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d4e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: '5%',
    backgroundColor: '#ededed',
    flexDirection: 'row',
    elevation: 10,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#0d4e4e',
    paddingVertical: 8,
  },
  chatBubbleContainerLeft: {
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
    marginVertical: 5,
  },
  chatBubbleContainerRight: {
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
    flexDirection: 'row-reverse',
    marginVertical: 5,
  },
  chatBubbleLeft: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    maxWidth: '80%',
  },
  chatBubbleRight: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 10,
    borderTopRightRadius: 0,
    maxWidth: '80%',
  },
  chatText: {
    color: '#eee',
    fontSize: 18,
    marginVertical: 8,
    alignSelf: 'center',
  },
});
