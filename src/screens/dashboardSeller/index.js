import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {connect} from 'react-redux';
import AddProduct from '../addProduct/index';
import EditProduct from '../editProduct/index';
import EditUser from '../editUser/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyFormat from 'react-currency-format';
import {ItemBox} from '../home/index';

function OrderBox({products}) {
  return Object.keys(products).map((v, i) => {
    return (
      <View key={i} style={styles.productContainer}>
        <Image style={styles.image} source={{uri: products[v].product.image}} />
        <View style={styles.ItemBoxText}>
          <Text style={styles.productName}>{products[v].product.name}</Text>
          <CurrencyFormat
            value={products[v].jumlah_harga}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            prefix={'Rp.'}
            renderText={(value) => (
              <Text style={styles.productPrice}>Total Harga : {value}</Text>
            )}
          />
          <Text style={styles.productPrice}>
            Jumlah pesanan : {products[v].jumlah}
          </Text>
        </View>
      </View>
    );
  });
}

class DashboardSeller extends Component {
  state = {
    search: '',
    productModal: false,
    addModal: false,
    userModal: false,
    ordersData: {},
    productDetail: {
      category: '1',
      description: '',
      image: {
        name: '',
        type: '',
        uri: 'https://static.thenounproject.com/png/187803-200.png',
      },
      name: '',
      price: '',
      stock: '',
      weight: '',
    },
    products: [],
    loading: true,
    tab: 'Product',
  };

  openProduct = (productId) => {
    this.setState({
      productModal: !this.state.productModal,
      productDetail: this.state.products[productId],
    });
  };

  openOrder() {
    AsyncStorage.getItem('token').then((token) => {
      fetch('https://tokonline.herokuapp.com/api/gasorder', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log('ini product orderan === ', JSON.stringify(resJson));
          this.setState({ordersData: resJson.data, loading: false}, () => {
            console.log('Ini  state ordersData', this.state.ordersData);
          });
        })
        .catch((err) => console.log('error catch open Order', err));
    });
  }

  geyMyProducts() {
    if (this.state.loading === true) {
      AsyncStorage.getItem('token').then((token) => {
        fetch('https://tokonline.herokuapp.com/api/ambil', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            // console.log('ini resjson produk saya === ', resJson);
            if (resJson.produk.length > 0) {
              this.setState({products: resJson.produk, loading: false});
            }
          })
          .catch((err) => console.log('error catch home', err));
      });
    }
  }

  componentDidUpdate() {
    if (this.state.loading) {
      this.geyMyProducts();
    }
  }

  componentDidMount() {
    this.geyMyProducts();
  }

  tabCust(tab) {
    if (this.state.tab === tab) {
      return {backgroundColor: 'teal'};
    } else {
      return {backgroundColor: '#eee'};
    }
  }

  switchTab(tab) {
    this.setState((prevState) => {
      if (prevState.tab !== tab) {
        return {tab: tab, loading: true};
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.sellerInfo}>
            <View style={styles.sellerPicCont}>
              {this.props.user.image ? (
                <Image
                  source={{uri: this.props.user.image}}
                  style={styles.profileImage}
                />
              ) : (
                <IonIcons
                  name={'person'}
                  size={40}
                  style={styles.profileIconDefault}
                />
              )}
              <View style={styles.profileName}>
                <Text numberOfLines={1} style={{maxWidth: 120}}>
                  {this.props.user.name}
                </Text>
                <MaterialCommunityIcons
                  onPress={() => {
                    ToastAndroid.show('Editing..', 1000);
                    this.setState({userModal: !this.state.userModal});
                  }}
                  name={'account-edit'}
                  size={25}
                  style={styles.editIcon}
                />
              </View>
            </View>
            <View style={styles.sellerDetail}>
              <Text style={styles.sellerDetailText}>
                <IonIcons
                  size={20}
                  name={'mail'}
                  onPress={() =>
                    console.log('Ini products', this.state.products)
                  }
                />
                {'   ' + this.props.user.email}
              </Text>
              <Text style={styles.sellerDetailText}>
                <IonIcons size={20} name={'md-location-sharp'} />
                {'   ' + this.props.user.alamat}
              </Text>
              <Text style={styles.sellerDetailText}>
                <IonIcons size={20} name={'call'} />
                {'   ' + this.props.user.no_telpon}
              </Text>
            </View>
          </View>
          <View style={styles.productsTitle}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => this.switchTab('Product')}
              style={[this.tabCust('Product'), styles.tab]}>
              <Text style={styles.productsTitleText}>Produk Kami</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                this.switchTab('Order');
                this.openOrder();
              }}
              style={[this.tabCust('Order'), styles.tab]}>
              <Text style={styles.productsTitleText}>Pesanan</Text>
            </TouchableOpacity>
          </View>
          {this.state.loading ? (
            <View style={styles.loadingCont}>
              <ActivityIndicator
                size={50}
                color={'black'}
                style={styles.loading}
              />
            </View>
          ) : this.state.tab === 'Product' ? (
            <ItemBox
              products={this.state.products}
              openProduct={(index) => this.openProduct(index)}
            />
          ) : Object.keys(this.state.ordersData).length > 0 ? (
            <OrderBox products={this.state.ordersData} />
          ) : (
            <Text>Belum ada pesanan</Text>
          )}
        </ScrollView>
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.addIconCont}
          onPress={() =>
            this.setState({
              addModal: !this.state.addModal,
            })
          }>
          <Image
            style={styles.addIcon}
            source={require('../../assets/plus.png')}
          />
        </TouchableOpacity>

        {/* ---Modal untuk edit produk--- */}
        <Modal
          animationType={'slide'}
          onRequestClose={() =>
            this.setState({
              productModal: !this.state.productModal,
            })
          }
          visible={this.state.productModal}>
          <EditProduct
            load={() => this.setState({loading: true})}
            product={this.state.productDetail}
            close={() =>
              this.setState({
                productModal: false,
              })
            }
          />
        </Modal>

        {/* ---Modal untuk tambah produk--- */}
        <Modal
          animationType={'slide'}
          onRequestClose={() =>
            this.setState({
              addModal: !this.state.addModal,
            })
          }
          visible={this.state.addModal}>
          <AddProduct
            load={() => this.setState({loading: true})}
            close={() =>
              this.setState({
                addModal: !this.state.addModal,
              })
            }
          />
        </Modal>

        {/* ---Modal untuk edit user--- */}
        <Modal
          animationType={'slide'}
          onRequestClose={() =>
            this.setState({
              userModal: !this.state.userModal,
            })
          }
          visible={this.state.userModal}>
          <EditUser
            close={() =>
              this.setState({
                userModal: !this.state.userModal,
              })
            }
          />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageProfile: {
    width: 100,
    height: 100,
  },
  sellerDetail: {
    height: '100%',
    justifyContent: 'space-evenly',
  },
  sellerDetailText: {
    fontSize: 15,
  },
  profileName: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconCont: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'teal',
    padding: 15,
    borderRadius: 100,
  },
  sellerPicCont: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  addIcon: {
    width: 45,
    height: 45,
  },
  sellerInfo: {
    height: 150,
    width: '100%',
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  header: {
    width: '100%',
    backgroundColor: '#106060',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 25,
    paddingLeft: 5,
  },
  scrollView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 6,
  },
  loadingCont: {
    width: '100%',
    alignItems: 'center',
  },
  loading: {
    margin: 100,
  },
  productContainer: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    marginVertical: 5,
    borderRadius: 5,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 17,
  },
  search: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 21,
    borderRadius: 30,
  },
  searchContainer: {
    flex: 1,
    margin: 6,
    backgroundColor: '#f2f2f2',
    fontSize: 19,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },
  profileIconDefault: {
    margin: 10,
    borderWidth: 1,
    padding: 25,
    borderRadius: 50,
  },
  profileImage: {
    borderRadius: 100,
    width: 100,
    height: 100,
  },
  productsTitle: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    elevation: 20,
    flexDirection: 'row',
  },
  productsTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSeller);
