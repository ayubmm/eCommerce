export default function user(
  state = {
    didUpdate: false,
    alamat: null,
    created_at: 'created_at_2020',
    email: '',
    email_verified_at: null,
    id: 0,
    image: null,
    name: '',
    no_telpon: null,
    updated_at: 'updated_at_2020',
  },
  action,
) {
  switch (action.type) {
    case 'CHANGE/USER':
      return {...state, ...action.payload};

    case 'DELETE/USER':
      return action.payload;
  }

  return state;
}
