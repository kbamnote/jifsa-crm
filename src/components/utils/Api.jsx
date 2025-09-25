import axios from "axios";

const Api = axios.create({
    baseURL:'https://jifsa-backend.onrender.com/'
})

export const getDetail = () => {
    return Api.get('get/read-form')
}