import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import CurrencyFormat from 'react-currency-format';
import ImagePicker from 'react-native-image-picker';
import Product from '../product/index';
import {connect} from 'react-redux';

function Progress({item}) {
  let name = '';
  let color = '';
  let text = '';
  if (item.status === '1') {
    name = 'progress-one';
    color = '#d1d110';
    text = 'Menunggu Pembayaran';
  } else if (item.status === '2') {
    name = 'progress-two';
    color = 'green';
    text = 'Menunggu Pengiriman';
  } else if (item.status === '3') {
    name = 'progress-full';
    color = 'blue';
    text = 'Selesai';
  }
  return (
    <View style={styles.status}>
      <Text>{text}</Text>
      <Entypo name={name} size={30} color={color} />
    </View>
  );
}

function OrderBox({products, getDetail}) {
  return products.map((v, i) => {
    return (
      <TouchableOpacity
        onPress={() => getDetail(v)}
        activeOpacity={0.8}
        key={i}
        style={styles.productContainer}>
        <View style={styles.ItemBoxText}>
          <Text style={styles.productName}>{v.tujuan}</Text>
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
        </View>
        <View style={styles.trashIcon}>
          <Progress item={v} />
        </View>
      </TouchableOpacity>
    );
  });
}

class Transaction extends Component {
  state = {
    cartItems: [],
    cartDetail: [],
    refreshing: false,
    modal: false,
    id: '',
    status: '',
    name: '',
    transfer_to: '',
    transfer_date: '',
    amount: '', //int
    bukti: {
      name: '',
      type: 'image/jpeg',
      uri: '',
    }, //(image)
    loading: true,
    productDetail: {},
    loadingDetail: true,
    modalProduct: false,
  };

  onRefresh() {
    this.getHistory();
    this.setState({refreshing: false});
  }

  takePic() {
    ImagePicker.showImagePicker(
      {
        noData: true,
        saveToPhotos: true,
        title: 'Select Photo',
        storageOptions: {
          skipBackup: false,
          path: 'images',
        },
      },
      (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = {
            uri: response.uri,
            name: response.fileName,
            type: response.type,
          };
          this.setState({
            bukti: source,
          });
        }
      },
    );
  }

  getDetail(value) {
    console.log('id pesanan', value.id);
    this.setState({
      modal: true,
      loading: true,
      id: value.id,
      status: value.status,
    });
    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai ambil detail');

        const endpoint =
          'https://tokonline.herokuapp.com/api/history/' + value.id;

        fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('resjson dari detail pesanan === ', resJson);
            if (resJson.status === 'Success') {
              this.setState({cartDetail: resJson.data, loading: false});
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  getDetailedProduct(id) {
    console.log('id product dari history ', id);
    this.setState({modalProduct: true, loadingDetail: true});
    console.log('mulai get product history');

    const endpoint = 'https://tokonline.herokuapp.com/api/product/' + id;

    fetch(endpoint)
      .then((res) => res.json())
      .then((resJson) => {
        console.log(
          'resjson dari detail setiap product dari history  === ',
          resJson,
        );
        if (resJson.status === 'Success') {
          this.setState({
            productDetail: resJson.data,
            loadingDetail: false,
          });
        }
      })
      .catch((err) => console.log(err));
  }

  getHistory() {
    this.setState({loading: true});
    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai ambil history');

        const endpoint = 'https://tokonline.herokuapp.com/api/history';

        fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('resjson dari gethistory === ', resJson.data);
            if (resJson.status === 'Success') {
              this.setState({cartItems: resJson.data, loading: false});
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  form() {
    const {name, amount, bukti, transfer_date, transfer_to} = this.state;
    let data = {
      name: name,
      amount: parseFloat(amount),
      transfer_date: transfer_date,
      transfer_to: transfer_to,
      bukti: bukti,
    };
    let form = new FormData();

    if (name && amount && transfer_date && transfer_to && bukti.name !== '') {
      for (let key in data) {
        form.append(key, data[key]);
      }
      console.log('Ini form konfirmasi === ', form);

      return form;
    } else {
      ToastAndroid.show('Lengkapi dahulu data di atas sebelum dikirim!', 5500);
    }
  }

  sendProof(id, status) {
    if (status === '2') {
      ToastAndroid.show(
        'Pesanan sudah terbayar, silahkan menunggu pengiriman',
        2000,
      );
    } else if (status === '1') {
      console.log('Mulai kirim konfirmasi pembayaran...');
      console.log('Ini id pesanan', id);
      const endpoint = 'https://tokonline.herokuapp.com/api/payment/' + id;

      AsyncStorage.getItem('token')
        .then((token) => {
          fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: this.form(),
          })
            .then((res) => res.json())
            .then((resJson) => {
              console.log(resJson);
              if (resJson.status === 'Success') {
                ToastAndroid.show('Pembayaran berhasil', 2500);
                this.props.changeUser({didCheckout: true});
                this.setState({modal: false});
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }
  }

  componentDidMount() {
    this.getHistory();
  }

  componentDidUpdate() {
    if (this.props.user.didCheckout) {
      this.getHistory();
      this.props.changeUser({didCheckout: false});
    }
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
          />
        }
        contentContainerStyle={styles.scrollView}>
        {!this.props.user.email ? (
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.6}
            onPress={() => {
              this.props.navigation.closeDrawer();
              this.props.navigation.navigate('Auth');
            }}>
            <Text style={styles.logoutText}>Log In or Register</Text>
          </TouchableOpacity>
        ) : this.state.loading ? (
          <ActivityIndicator style={{padding: 50}} size={45} color={'white'} />
        ) : (
          <OrderBox
            getDetail={(id) => this.getDetail(id)}
            products={this.state.cartItems}
          />
        )}
        {/* ---Modal untuk Kirim Bukti Pembayaran */}
        <Modal
          visible={this.state.modal}
          onRequestClose={() => this.setState({modal: false})}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {this.state.loading ? (
              <ActivityIndicator
                style={{padding: 50}}
                size={45}
                color={'white'}
              />
            ) : (
              <>
                {this.state.cartDetail.map((v, i) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        console.log(v.product_id);
                        this.getDetailedProduct(v.product_id);
                      }}
                      key={i}
                      style={styles.productReview}>
                      <View>
                        <Text style={styles.reviewText}>
                          Jumlah pesanan : {v.jumlah}
                        </Text>
                        <Text style={styles.reviewText}>
                          Total Harga : {v.jumlah_harga}
                        </Text>
                      </View>
                      <IonIcons name={'chevron-forward'} size={56} />
                    </TouchableOpacity>
                  );
                })}
                <Text style={styles.inputTitle}>Nama</Text>
                <TextInput
                  style={styles.input}
                  value={this.state.name}
                  placeholder={'Nama'}
                  onChangeText={(teks) => this.setState({name: teks})}
                />
                <Text style={styles.inputTitle}>Rekening Tujuan</Text>
                <TextInput
                  style={styles.input}
                  value={this.state.transfer_to}
                  placeholder={'Rekening Tujuan'}
                  onChangeText={(teks) => this.setState({transfer_to: teks})}
                />
                <Text style={styles.inputTitle}>
                  Tanggal Transfer (YYYY-MM-DD)
                </Text>
                <TextInput
                  style={styles.input}
                  value={this.state.transfer_date}
                  placeholder={'Tanggal Transfer'}
                  onChangeText={(teks) => this.setState({transfer_date: teks})}
                />
                <Text style={styles.inputTitle}>Jumlah Transfer</Text>
                <TextInput
                  style={styles.input}
                  value={this.state.amount}
                  placeholder={'Jumlah Transfer'}
                  onChangeText={(teks) => this.setState({amount: teks})}
                />
                <Text style={[styles.inputTitle, styles.proof]}>
                  Upload Bukti Transfer
                </Text>
                <TouchableOpacity onPress={() => this.takePic()}>
                  {this.state.bukti.uri ? (
                    <Image
                      source={{uri: this.state.bukti.uri}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <IonIcons
                      name={'camera'}
                      size={80}
                      style={styles.profileIconDefault}
                      color={'black'}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.sendProof(this.state.id, this.state.status)
                  }
                  style={styles.sendButton}>
                  <Text style={styles.sendText}>Kirim</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Modal>
        <Modal
          visible={this.state.modalProduct}
          onRequestClose={() =>
            this.setState({
              modalProduct: false,
            })
          }>
          {this.state.loadingDetail ? (
            <ActivityIndicator
              style={{padding: 50}}
              size={45}
              color={'white'}
            />
          ) : (
            <Product
              product={this.state.productDetail}
              close={() =>
                this.setState({
                  modalProduct: false,
                })
              }
            />
          )}
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    padding: 6,
    alignItems: 'center',
    backgroundColor: 'teal',
  },
  status: {
    width: 100,
    height: '100%',
  },
  proof: {
    alignSelf: 'center',
    marginTop: 15,
  },
  inputTitle: {
    color: 'white',
    alignSelf: 'flex-start',
    fontSize: 17,
  },
  logoutText: {
    fontWeight: 'bold',
    color: 'teal',
  },
  loginButton: {
    marginTop: 100,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
  },
  sendText: {
    fontSize: 20,
    color: 'teal',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    margin: 3,
    borderRadius: 15,
    width: '100%',
    backgroundColor: 'white',
  },
  profileIconDefault: {
    margin: 10,
    borderWidth: 1,
    padding: 25,
    borderRadius: 5,
    borderColor: 'white',
  },
  profileImage: {
    borderRadius: 5,
    width: 130,
    height: 130,
  },
  reviewText: {
    fontSize: 17,
    margin: 5,
  },
  productReview: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    elevation: 10,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productContainer: {
    width: '100%',
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 5,
    elevation: 10,
    flexDirection: 'row',
    marginVertical: 10,
  },
  ItemBoxText: {
    padding: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 15,
  },
  trashIcon: {
    position: 'absolute',
    bottom: 3,
    right: 5,
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

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);
