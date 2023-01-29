import Taro from '@tarojs/taro'
import { getStorage } from '@/utils/storage';
import { reLaunch } from '@/utils/application'

const hosts = {
    [Taro.ENV_TYPE.WEB]: '', // h5 使用 devServer 代理
    // [Taro.ENV_TYPE.WEB]: 'http://localhost:9999', // h5 使用 devServer 代理
    // [Taro.ENV_TYPE.WEAPP]: 'http://localhost:8888', // 小程序指定 host 访问
}
const host = hosts[Taro.getEnv()];

// urlencoded格式拼接请求参数
function objUrlEncode(params) {
    let data = !params ? '' : Object.keys(params).reduce((param, key) => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
            return param;
        }
        return param + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
    }, '');
    return data.substring(0, data.length - 1);
}

// Http GET 请求
const fetch = function (method, url, params) {
    const token = getStorage('_t');
    return new Promise(function (resolve, reject) {
        try {
            const data = objUrlEncode(params);
            Taro.request({
                url: host + url,
                method,
                data,
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': token
                },
                dataType: 'json',
                timeout: 5000,
                retryTimes: 0,
                complete(res) {
                    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 422) {
                        // 跳登录
                        reLaunch({
                            url: "/pages/login/login"
                        })
                    }

                    if (res.statusCode !== 200 || res.data.code) { // || !res.data
                        return reject(res.data || {});
                    }
                    resolve(res.data);
                },
            });
        } catch (e) {
            reject({ code: 400, message: e.message || '网络错误' });
        }
    })
}

export const get = (url, params) => fetch('GET', url, params);

export const post = (url, params) => fetch('POST', url, params);

export const serverHost = host;
