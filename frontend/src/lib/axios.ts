import { createClient } from "@/utils/supabase/client";
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080"
})

api.interceptors.request.use(async (config) => {
    const supabase = createClient();

    const {data: {session}} = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;