import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ToastAndroid,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import CurrencyFormat from 'react-currency-format';
import IonIcons from 'react-native-vector-icons/Ionicons';

export function CartBox({
  deleteItem = () => console.log('delete Order'),
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
                Total Harga {'\n'} {value}
              </Text>
            )}
          />
          <Text style={styles.productPrice}>
            Jumlah pesanan {'\n' + v.jumlah}
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
    loading: true,
    confirmLoad: false,
    modal: false,
    address: '',
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
      {cancelable: true},
    );
  }

  orderConf() {
    if (this.state.cartItems.length > 0) {
      this.setState({modal: true});
    } else {
      ToastAndroid.show('Tidak ada barang di keranjang', 4000);
    }
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
    if (this.state.address) {
      this.checkout();
    } else {
      ToastAndroid.show('Masukkan alamat anda dengan benar', 2500);
    }
  }

  checkout() {
    console.log('mulai checkout...');
    this.setState({confirmLoad: true});
    var endpoint = 'https://tokonline.herokuapp.com/api/konfirmasi-check-out';

    let form = new FormData();

    form.append('tujuan', this.state.address);

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
        .then((resJson) => {
          console.log('ini ResJson checkout === ', resJson);
          if (resJson.status === 'Success') {
            this.props.changeUser({
              didCheckout: true,
              didCart: true,
            });
            this.setState({confirmLoad: false, modal: false});
            ToastAndroid.show('Checkout berhasil', 2000);
          }
        });
    });
  }

  getCart() {
    this.setState({loading: true});
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
            console.log('resjson dari getcart === ', resJson);
            if (resJson.data) {
              this.setState({
                cartItems: resJson.data,
                loading: false,
                modal: false,
              });
            } else {
              this.setState({
                modal: false,
                loading: false,
                cartItems: [],
              });
              ToastAndroid.show('Keranjang Kosong', 1500);
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  componentDidMount() {
    this.getCart();
  }

  componentDidUpdate() {
    if (this.props.user.didCart) {
      console.log('component did update jalan...');
      this.getCart();
      this.props.changeUser({didCart: false});
    }
  }

  render() {
    return (
      <>
        <ScrollView contentContainerStyle={styles.container}>
          {this.state.loading ? (
            <ActivityIndicator style={{padding: 50}} size={45} color={'teal'} />
          ) : (
            <CartBox
              products={this.state.cartItems}
              openProduct={() => console.log('Open product not available')}
              deleteItem={(id) => this.deleteConf(id)}
            />
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.checkOutConfirmButton}
          onPress={() => {
            this.orderConf();
          }}>
          <Text style={styles.checkOutText}>Checkout</Text>
        </TouchableOpacity>
        <Modal
          animationType={'fade'}
          transparent={true}
          visible={this.state.modal}
          onRequestClose={() => this.setState({modal: false})}>
          <View style={styles.modalBack}>
            <View style={styles.modalOrder}>
              <Text style={styles.addressTitle}>
                Masukkan Alamat Pengiriman
              </Text>
              <TextInput
                value={this.state.address}
                onChangeText={(text) => this.setState({address: text})}
                placeholder={'Alamat'}
                style={styles.input}
                autoCapitalize={'words'}
              />
              <TouchableOpacity
                style={styles.checkOutButton}
                onPress={() => this.konfirmasiCheckout()}>
                {this.state.confirmLoad ? (
                  <ActivityIndicator size={25} color={'white'} />
                ) : (
                  <Text style={styles.promptButtonText}>Checkout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: 6,
    justifyContent: 'center',
  },
  addressTitle: {
    fontSize: 19,
  },
  input: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'teal',
    borderRadius: 10,
    marginVertical: 15,
  },
  modalBack: {
    flex: 1,
    backgroundColor: '#808080b8',
    justifyContent: 'center',
  },
  modalOrder: {
    width: '80%',
    height: 220,
    position: 'absolute',
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 15,
    borderRadius: 15,
    elevation: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutButton: {
    backgroundColor: 'teal',
    padding: 10,
    alignItems: 'center',
    elevation: 25,
    borderRadius: 10,
  },
  promptButtonText: {
    fontSize: 17,
    color: 'white',
  },
  checkOutConfirmButton: {
    backgroundColor: 'teal',
    padding: 10,
    alignItems: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 10,
    flexDirection: 'row',
    marginVertical: 5,
  },
  ItemBoxText: {
    padding: 5,
  },
  image: {
    height: 120,
    width: 100,
    resizeMode: 'cover',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
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
