import axios, { AxiosError } from 'axios';

export const getPage = async (subdomain: string, path: string) => {
  try {
    const { data, status } = await axios.get(
      `${process.env.API_ENDPOINT}/api/v2/internal/deployment/${subdomain}/static-props`,
      {
        params: {
          path,
          basePath: process.env.BASE_PATH,
        },
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      }
    );
    return { data, status };
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError?.response?.status === 403) {
      console.warn(
        'Attempted to fetch props for subdomain',
        subdomain,
        'but the request was forbidden (403).'
      );
    }

    // Show a 404 page instead of crashing
    if (axiosError?.response?.status === 400 || axiosError?.response?.status === 403) {
      return { data: {}, status: axiosError?.response.status };
    } else {
      throw error;
    }
  }
};
