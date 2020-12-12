import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';

class ProfileDrawer extends Component {
  componentDidMount() {
    console.log('This is from drawer');
  }

  // navigationColor(screen) {
  //   if(this.props.route.name === screen)
  // }

  render() {
    console.log(
      'ini state history dari drawer === ',
      this.props.state.history[this.props.state.history.length - 1].key,
    );
    return (
      <View style={styles.container}>
        <View style={styles.profileIconContainer}>
          {this.props.user.image ? (
            <Image
              source={{uri: this.props.user.image}}
              style={styles.profileImage}
            />
          ) : (
            <IonIcons name={'person'} size={60} />
          )}
        </View>
        {this.props.user.email !== '' ? (
          <>
            <Text style={styles.username} numberOfLines={1}>
              Hi,
              <Text> {this.props.user.name}</Text>
            </Text>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('BottomTab')}
              style={styles.drawerScreens}
              activeOpacity={0.7}>
              <View style={styles.navigation}>
                <IonIcons name={'home'} size={25} />
                <Text style={styles.buttonsText}>Home</Text>
              </View>
              <IonIcons name={'chevron-forward'} size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('DashboardSeller')}
              style={styles.drawerScreens}
              activeOpacity={0.7}>
              <View style={styles.navigation}>
                <MaterialCommunityIcons name={'store'} size={25} />
                <Text style={styles.buttonsText}>Akun & Toko Saya</Text>
              </View>
              <IonIcons name={'chevron-forward'} size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Cart')}
              style={styles.drawerScreens}
              activeOpacity={0.7}>
              <View style={styles.navigation}>
                <IonIcons name={'cart'} size={25} />
                <Text style={styles.buttonsText}>Keranjang</Text>
              </View>
              <IonIcons name={'chevron-forward'} size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() =>
                AsyncStorage.removeItem(
                  'token',
                  this.props.navigation.replace('Auth'),
                )
              }>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.6}
            onPress={() => {
              this.props.navigation.closeDrawer();
              this.props.navigation.navigate('Auth');
            }}>
            <Text style={styles.logoutText}>Log In or Register</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: '100%',
    height: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  profileImage: {
    height: 120,
    width: 120,
    borderRadius: 100,
  },
  profileIcon: {
    borderRadius: 100,
    padding: 25,
    backgroundColor: '#808080de',
    margin: 15,
  },
  buttonsText: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 7,
    borderRadius: 10,
  },
  logoutText: {
    fontWeight: 'bold',
    color: 'white',
  },
  loginButton: {
    backgroundColor: 'teal',
    padding: 13,
    borderRadius: 10,
  },
  drawerScreens: {
    width: '100%',
    flexDirection: 'row',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 5,
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDrawer);
