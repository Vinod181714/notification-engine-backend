import axios from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000' });

// Attach token from cookie to each request
api.interceptors.request.use((config) => {
	const token = Cookies.get('token');
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Global response handling: redirect to login on 401
api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err.response && err.response.status === 401) {
			Cookies.remove('token');
			if (typeof window !== 'undefined') Router.push('/login');
		}
		return Promise.reject(err);
	}
);

export default api;
