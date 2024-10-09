import { createAuth0 } from '@auth0/auth0-vue';
export default createAuth0({
    domain: "dev-wevln0dxgel5lwyp.eu.auth0.com",
    clientId: "38pEDftWxL4celpcP41mIcsHAjLn3jtz",
    authorizationParams: {
        redirect_uri: "http://localhost:3000"
    }
});