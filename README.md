### Login google firebase

##### Install

```
npm i firebase
```

##### File config

```
import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
    apiKey: 'AIzaSyDhi-RpcEX7I90u2Cnyu6aQ7nqr4NVn-cc',
    authDomain: 'dashboard-c5c87.firebaseapp.com',
    projectId: 'dashboard-c5c87',
    storageBucket: 'dashboard-c5c87.appspot.com',
    messagingSenderId: '581124479999',
    appId: '1:581124479999:web:1692d983695ca7cbaee5ca',
    measurementId: 'G-8LWNYPHME3',
};


export const app = initializeApp(firebaseConfig);
```

##### Import

```
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
```

##### Hàm đăng nhập

```
const loginGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);

        const secureToken = await request.post(
            `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`,
            {
                grant_type: 'refresh_token',
                refresh_token: result._tokenResponse.refreshToken,
            },
        );
    } catch (error) {
    }
};
```
