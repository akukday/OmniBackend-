import axios, { AxiosResponse } from 'axios';

const customAxios = axios.create({
    timeout: 30000
});

export function axiosRequest<T>(config: any): Promise<AxiosResponse<T>> {
    const { method, baseURL, url, data, params, headers } = config;
    return customAxios.request<T>({
        method: method ?? 'get',
        baseURL: baseURL,
        url: url,
        data: data,
        params: params,
        headers: headers
    });
}

