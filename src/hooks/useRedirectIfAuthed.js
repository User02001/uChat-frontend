import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

let cachedStatus = null;
let pendingPromise = null;

const getAuthStatus = () => {
 if (cachedStatus !== null) return Promise.resolve(cachedStatus);
 if (!pendingPromise) {
  pendingPromise = fetch('/api/me', { credentials: 'include' })
   .then(res => {
    cachedStatus = res.ok;
    return cachedStatus;
   })
   .catch(() => {
    cachedStatus = false;
    return false;
   });
 }
 return pendingPromise;
};

const useRedirectIfAuthed = () => {
 const navigate = useNavigate();
 const [checked, setChecked] = useState(false);

 useEffect(() => {
  getAuthStatus().then(ok => {
   if (ok) navigate('/chat', { replace: true });
   else setChecked(true);
  });
 }, []);

 return checked;
};

export default useRedirectIfAuthed;