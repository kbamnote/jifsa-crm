import axios from "axios";

const Api = axios.create({
    baseURL:'https://jifsa-backend.onrender.com/'
})

export const getDetail = () => {
    return Api.get('form/read-form')
}

export const getComplaint = () => {
    return Api.get('complain/read-form')
}