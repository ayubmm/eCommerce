import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ToastAndroid,
} from 'react-native';
import {connect} from 'react-redux';
import CurrencyFormat from 'react-currency-format';
import IonIcons from 'react-native-vector-icons/Ionicons';

export function CartBox({
  deleteItem = () => console.log('delet eOrder'),
  products,
}) {
  return products.map((v, i) => {
    return (
      <View key={i} style={styles.productContainer}>
        <Image style={styles.image} source={{uri: v.product.image}} />
        <View style={styles.ItemBoxText}>
          <Text style={styles.productName}>{v.product.name}</Text>
          <CurrencyFormat
            value={v.jumlah_harga}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            prefix={'Rp.'}
            renderText={(value) => (
              <Text style={styles.productPrice}>
                Total Harga : {'\n'} {value}
              </Text>
            )}
          />
          <Text style={styles.productPrice}>
            Jumlah pesanan : {'\n' + v.jumlah}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.trashIcon}
          onPress={() => deleteItem(v.id)}>
          <IonIcons name={'trash'} size={30} color={'red'} />
        </TouchableOpacity>
      </View>
    );
  });
}

class Cart extends Component {
  state = {
    cartItems: [],
  };

  deleteConf(id) {
    Alert.alert(
      'Hapus Pesanan',
      'Apakah anda yakin untuk menghapus pesanan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: () => this.deleteOrder(id),
        },
      ],
      {cancelable: false},
    );
  }

  deleteOrder(id) {
    const endpoint = `https://tokonline.herokuapp.com/api/check-out/${id}`;

    AsyncStorage.getItem('token').then((token) => {
      fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log('ini resJson delete', resJson);
          if (resJson.status === 'Success') {
            this.getCart();
            ToastAndroid.show('Pesanan berhasil dihapus', 3500);
          } else {
            ToastAndroid.show(
              'Pesanan gagal dihapus,\nSilahkan coba lagi!',
              3500,
            );
          }
        });
    });
  }

  konfirmasiCheckout() {
    var endpoint = 'https://tokonline.herokuapp.com/api/konfirmasi-check-out';

    let form = new FormData();

    form.append('tujuan', 'Asalann....');
    AsyncStorage.getItem('token').then((token) => {
      console.log('ini from', form);
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })
        .then((res) => res.json())
        .then((resJson) => console.log('ini ResJson === ', resJson));
    });
  }

  getCart() {
    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai ambil data cart');

        const endpoint = 'https://tokonline.herokuapp.com/api/check-out';

        fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('resjson dari getcart === ', resJson.data);
            if (resJson.status === 'Success') {
              this.setState({cartItems: resJson.data});
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  componentDidMount() {
    this.getCart();
  }

  render() {
    return (
      <>
        <ScrollView contentContainerStyle={styles.container}>
          <CartBox
            products={this.state.cartItems}
            openProduct={() => console.log('Open product not available')}
            deleteItem={(id) => this.deleteConf(id)}
          />
        </ScrollView>
        <TouchableOpacity
          style={styles.checkOutButton}
          onPress={() => {
            this.konfirmasiCheckout();
          }}>
          <Text style={styles.checkOutText}>Checkout</Text>
        </TouchableOpacity>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
    padding: 15,
  },
  checkOutButton: {
    backgroundColor: 'teal',
    padding: 10,
    alignItems: 'center',
    width: '100%',
    elevation: 25,
  },
  checkOutText: {
    color: 'white',
    fontSize: 23,
  },
  trashIcon: {
    position: 'absolute',
    bottom: 3,
    right: 5,
  },
  productContainer: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    margin: 6,
    borderRadius: 5,
    elevation: 10,
    flexDirection: 'row',
  },
  ItemBoxText: {
    padding: 5,
  },
  image: {
    height: 120,
    width: 100,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 15,
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

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
