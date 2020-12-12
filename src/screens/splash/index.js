import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';

class Splash extends Component {
  state = {
    loading: false,
  };

  getProfile(token) {
    console.log('mulai getProfile...');
    setTimeout(() => {
      this.setState({loading: true});
    }, 500);
    const endpoint = 'https://tokonline.herokuapp.com/api/profile';
    fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resjson) => {
        console.log('ini resjson getprofile', resjson);
        if (!resjson.data) {
          this.props.navigation.replace('Drawer');
          ToastAndroid.show('Anda masuk sebagai tamu.', 5000);
        } else if (resjson.data) {
          this.updateState(resjson.data);
        }
      })
      .catch((err) => {
        console.log('error dari splash profile', err);
        this.props.navigation.replace('Drawer');
      });
  }

  componentWillUnmount() {
    this.setState({loading: true});
  }

  async updateState(data) {
    this.props.changeUser(data);
    console.log('ini user.email', this.props.user.email);
    if (this.props.user.email) {
      this.props.navigation.replace('Drawer');
    } else {
      ToastAndroid.show('Something went wrong,\nPlease reload.', 10000);
    }
  }

  tokenCheck() {
    AsyncStorage.getItem('token').then((res) => {
      console.log('ini token ', res);
      if (res) {
        this.getProfile(res);
      } else {
        this.props.navigation.replace('Drawer');
      }
    });
  }

  componentDidMount() {
    setTimeout(() => {
      this.tokenCheck();
    }, 500);
  }

  render() {
    return (
      <View style={styles.container}>
        <IonIcons name={'cart-outline'} color={'white'} size={180} />
        <Text style={styles.splashText}> TOKONLINE </Text>
        <View style={styles.ActivityIndicator}>
          {this.state.loading && (
            <ActivityIndicator size={25} color={'white'} />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d4e4e',
  },
  splashText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: 'white',
  },
  ActivityIndicator: {
    margin: 30,
    height: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeUser: (data) => dispatch({type: 'CHANGE/USER', payload: data}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
