import { useAuth0 } from '@auth0/auth0-react';
import axios, { Method, AxiosRequestConfig, AxiosResponse } from 'axios';

interface RequestConfig<T> {
  url: string;
  method: Method;
  body?: T;
  scope: string;
}

async function apiRequest<TRequest, TResponse>(
  config: RequestConfig<TRequest>,
): Promise<TResponse> {
  const { url, method, body, scope } = config;
  const { getAccessTokenSilently } = useAuth0();
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://tutereview.org/api/',
        scope,
      },
    });

    const axiosConfig: AxiosRequestConfig = {
      url,
      method: method,
      headers: { Authorization: `Bearer ${token}` },
      data: body,
    };

    const response: AxiosResponse<TResponse> = await axios(axiosConfig);

    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export default apiRequest;
