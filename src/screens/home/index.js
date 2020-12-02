import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ToastAndroid,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import CurrencyFormat from 'react-currency-format';
import {connect} from 'react-redux';
import Product from '../product/index';

export function ItemBox({openProduct, products}) {
  return products.map((v, i) => {
    return (
      <TouchableOpacity
        onPress={() => {
          openProduct(i);
        }}
        activeOpacity={0.8}
        key={i}
        style={styles.productContainer}>
        <Image style={styles.image} source={{uri: v.image}} />
        <View style={styles.ItemBoxText}>
          <CurrencyFormat
            value={v.price}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            prefix={'Rp.'}
            renderText={(value) => (
              <Text style={styles.productPrice}>{value}</Text>
            )}
          />
          <Text numberOfLines={2} style={styles.productName}>
            {v.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });
}

function SearchScreen({
  searchComponent,
  setSearchComponent,
  searchData,
  openSearchProduct,
}) {
  if (searchComponent) {
    return (
      <View style={styles.searchComponent}>
        <View style={styles.closeSearchCont}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSearchComponent()}>
            <IonIcons color={'red'} name={'close-circle'} size={40} />
          </TouchableOpacity>
          <Text style={styles.searchTitle}>Hasil Pencarian</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ItemBox products={searchData} openProduct={openSearchProduct} />
        </ScrollView>
      </View>
    );
  }
  return <></>;
}

class Home extends Component {
  state = {
    search: '',
    searchComponent: false,
    productModal: false,
    productDetail: {},
    products: [],
    searchData: [],
  };

  search() {
    if (this.state.search) {
      this.setState({searchComponent: true});
      const endpoint = 'https://tokonline.herokuapp.com/api/product/search';
      let form = new FormData();
      form.append('search', this.state.search);

      fetch(endpoint, {
        method: 'POST',
        body: form,
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log('ini search ', resJson[0].data);
          this.setState({searchData: resJson[0].data});
        });
    } else {
      ToastAndroid.show('Mohon isi teks pencarian!', 3500);
    }
  }

  openProduct = (productId) => {
    this.setState({
      productModal: !this.state.productModal,
      productDetail: this.state.products[productId],
    });
  };

  openSearchProduct = (productId) => {
    this.setState({
      productModal: !this.state.productModal,
      productDetail: this.state.searchData[productId],
    });
  };

  getAllProduct() {
    fetch('https://tokonline.herokuapp.com/api/product')
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson[0].data.length !== 0) {
          this.setState({products: resJson[0].data});
        }
      })
      .catch((err) => console.log('error catch home', err));
  }

  componentDidUpdate() {
    if (this.props.user.didUpdate === true) {
      this.getAllProduct();
      this.props.changeUser({didUpdate: false});
    }
  }

  componentDidMount() {
    this.getAllProduct();
  }

  render() {
    console.log('ini didupdate', this.props.user.didUpdate);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IonIcons
            onPress={() => this.props.navigation.openDrawer()}
            name={'menu'}
            size={50}
            color={'black'}
          />
          <View style={styles.searchContainer}>
            <TextInput
              autoCapitalize={'none'}
              placeholder={'Search'}
              style={styles.search}
              value={this.state.search}
              returnKeyType={'search'}
              onSubmitEditing={() => this.search()}
              onChangeText={(text) => this.setState({search: text})}>
              {/* <CurrencyFormat
                  value={this.state.search}
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp.'}
                /> */}
            </TextInput>
            <TouchableOpacity>
              {this.state.search !== '' && (
                <IonIcons
                  onPress={() => this.setState({search: ''})}
                  name={'close'}
                  color={'#0d4e4e'}
                  size={35}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* ---Komponen Untuk Search---*/}
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ItemBox
            products={this.state.products}
            openProduct={(index) => this.openProduct(index)}
          />
        </ScrollView>
        <SearchScreen
          searchComponent={this.state.searchComponent}
          searchData={this.state.searchData}
          openSearchProduct={(index) => this.openSearchProduct(index)}
          setSearchComponent={() => this.setState({searchComponent: false})}
        />

        {/* ---Modal Untuk Product--- */}
        <Modal
          animationType={'slide'}
          onRequestClose={() => this.openProduct()}
          visible={this.state.productModal}>
          <Product
            product={this.state.productDetail}
            close={() =>
              this.setState({
                productModal: !this.state.productModal,
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
  header: {
    height: 65,
    width: '100%',
    backgroundColor: '#106060',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 25,
    paddingLeft: 5,
  },
  closeSearchCont: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  searchTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  searchComponent: {
    backgroundColor: '#eee',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 65,
    elevation: 100,
  },
  closeButton: {
    alignContent: 'flex-start',
    position: 'absolute',
    left: 10,
  },
  scrollView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 100,
  },
  productContainer: {
    width: '46%',
    backgroundColor: '#f2f2f2',
    margin: 6,
    borderRadius: 5,
    elevation: 10,
  },
  ItemBoxText: {
    padding: 5,
  },
  image: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 20,
  },
  productPrice: {
    fontSize: 21,
    fontWeight: 'bold',
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
