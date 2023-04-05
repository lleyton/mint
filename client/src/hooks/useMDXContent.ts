import { useContext } from 'react';

import { MDXContentContext } from '@/context/MDXContentContext';

export const useMDXContent = () => useContext(MDXContentContext);
