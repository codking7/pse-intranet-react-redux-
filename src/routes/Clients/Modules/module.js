import { APIConstants } from '../../../components/Api/APIConstants'
import { push } from 'react-router-redux'
import request from 'superagent-bluebird-promise'

export const initialState = {
  loading: false,
  loading_client: false,
  client_id: null,
  clients_list: [],
  client_info: {},
  formData: {newOrEdit: 'new'},
  showModalFlag: false,
  searchParameters: [{'key':'name', 'value':''}, {'key':'address', 'value':''}, {'key':'city', 'value':''}],
  pagination: {
    total_items: 0,
    page: 1,
    last_page: 1,
    per_page: 25
  }
}

export const ACTION_HANDLERS = {
  'LOADING_CLIENTS': (state, action) => {
    return ({
      ...state,
      'loading': true
    })
  },
  'LOADING_CLIENT_INFO': (state, action) => {
    return ({
      ...state,
      'loading_client': true,
      'client_id' : action.id
    })
  },
  'GET_CLIENT_INFO_SUCCESS': (state, action) => {
    return ({
      ...state,
      'client_info': action.client_info,
      'loading_client': false
    })
  },
  'GET_CLIENTS_SUCCESS': (state, action) => {
    return ({
      ...state,
      'clients_list': action.clients_list,
      'loading': false,
      'pagination': Object.assign({}, state.pagination, action.pagination),
      'searchParameters': action.parameters
    })
  },
  'NEW_CLIENT_LOADING': (state, action) => {
    return ({
      ...state,
      'formData': Object.assign({}, state.formData, {'loading': true})
    })
  },
  'NEW_CLIENT_SUCCESS': (state, action) => {
    return ({
      ...state,
      'client_info': action.client_info,
      'formData': Object.assign({}, state.formData, {'loading': false}),
      'showModalFlag': false
    })
  },
  'NEW_CLIENT_ERROR': (state, action) => {
    return ({
      ...state,
      'formData': Object.assign({}, state.formData, {'errorMessage': action.errorMessage, 'loading': false}),
      'client_info': {}
    })
  },
  'SHOW_MODAL': (state, action) => {
    return ({
      ...state,
      'showModalFlag': true,
      'formData': Object.assign({}, state.formData, {'newOrEdit': action.newOrEdit})
    })
  },
  'CLOSE_MODAL': (state, action) => {
    return ({
      ...state,
      'showModalFlag': false,
      'formData': {}
    })
  }
}

export const getClientsList = (param, pagination = {}) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken
    let parameters = {}
    param.map(function(p){
      if(p.value != '') {
        parameters[p.key] = p.value
      }
    })

    if (!pagination.hasOwnProperty('page')) {
      parameters['page'] = 1
    }else{
      parameters['page'] = pagination['page']
    }
    if (!pagination.hasOwnProperty('per_page')) {
      parameters['per_page'] = 25
    }else{
      parameters['per_page'] = pagination['per_page']
    }

    dispatch({
      'type': 'LOADING_CLIENTS'
    })

    request.post(`${APIConstants.API_SERVER_NAME}clients_list`)
      .send(JSON.stringify(Object.assign({}, parameters, {
        'access_token': accessToken,
        'minimal': 1
      })))
      .set('Content-Type', 'application/json')
      .then(function (response) {

        const data = JSON.parse(response.text)
        if(data.status_code < 400) {
          const paginator = {
            'total_items': data.paginator.total_items,
            'page': data.paginator.current_page,
            'last_page': data.paginator.last_page
          }

          if(pagination.hasOwnProperty('page')){
            if(pagination['page'] <= data.paginator.last_page){
              paginator['page'] = pagination['page']
            }
          }

          dispatch({
            'type': 'GET_CLIENTS_SUCCESS',
            'clients_list': data.data,
            'pagination': paginator,
            'parameters': param
          })

        }else {
          console.log(data.error)
          if (data.error[0].code == 'ExpiredAccessToken') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

      }, function (err) {
        console.log(err)
      })
  }
}

export const getClientInfo = (id) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken

    dispatch({
      type: 'LOADING_CLIENT_INFO',
      id: id
    })

    request.post(`${APIConstants.API_SERVER_NAME}client_info`)
      .send(JSON.stringify({'access_token': accessToken, 'id': id}))
      .set('Content-Type', 'application/json')
      .then(function (response) {

        const data = JSON.parse(response.text)
        console.log(data)

        if(data.status_code < 400) {
          if (data.hasOwnProperty('data')) {

            dispatch({
              'type': 'GET_CLIENT_INFO_SUCCESS',
              'client_info': data.data
            })
          }

          const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
          if (width < 992) {
            setTimeout(function () {
              const scrollContent = document.getElementById('scroll-content')
              scrollContent.scrollTop = parseInt(document.getElementById('client_info_section').getBoundingClientRect().top)
            }, 10)
          }
        }else{
          if(data.error[0].code == 'ExpiredAccessToken'){
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

      }, function (err) {
        console.log(err)
      })
  }
}

export const createClient = (name) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken

    dispatch({
      type: 'NEW_CLIENT_LOADING'
    })

    request.post(`${APIConstants.API_SERVER_NAME}clients_create`)
      .send(JSON.stringify({'access_token': accessToken, 'name': name}))
      .set('Content-Type', 'application/json')
      .then(function (response) {

        const data = JSON.parse(response.text)

        if ((data.status_code == 201) || (data.status_code == 200)) {

          dispatch({
            type: 'NEW_CLIENT_SUCCESS',
            client_info: data.data
          })

        } else{
          if(data.error[0].code == 'ExpiredAccessToken'){
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }

          let message = ''
          if (data.error) {
            message = data.error[0].message
          }

          dispatch({
            type: 'NEW_CLIENT_ERROR',
            errorMessage: message
          })
        }

      }, function (err) {
        console.log(err)
      })
  }
}

export const closeModalFunc = () => {
  return (dispatch) => {
    dispatch({
      type: 'CLOSE_MODAL'
    })
  }
}

export const showModalFunc = (newOrEdit) => {
  return (dispatch) => {
    dispatch({
      type: 'SHOW_MODAL',
      newOrEdit: newOrEdit
    })
  }
}

export const addNoteToClient = (clientId) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken

  }
}

export const deleteNote = (clientId, noteId) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken

    request.post(`${APIConstants.API_SERVER_NAME}client_note_delete`)
      .send(JSON.stringify({'access_token': accessToken, 'client_id': clientId, 'note_id': noteId}))
      .set('Content-Type', 'application/json')
      .then(function (response) {

        const data = JSON.parse(response.text)
        console.log(data)

        if(data.status_code > 400) {
          if (data.error[0].code == 'ExpiredAccessToken') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

      }, function (err) {
        console.log(err)
      })
  }
}

export const createNote = (clientId, note) => {
  return (dispatch) => {
    const accessToken = localStorage.accessToken
    console.log(note)
    request.post(`${APIConstants.API_SERVER_NAME}client_note_add`)
      .send(JSON.stringify({'access_token': accessToken, 'client_id': clientId, 'note': note.note, 'type': {'id': 1, 'type': note.type.type}}))
      .set('Content-Type', 'application/json')
      .then(function (response) {

        const data = JSON.parse(response.text)
        console.log(data)

        if(data.status_code > 400) {
          if (data.error[0].code == 'ExpiredAccessToken') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }

      }, function (err) {
        console.log(err)
      })
  }
}
