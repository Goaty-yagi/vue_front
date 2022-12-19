import createPersistedState from 'vuex-persistedstate'
import Cookies from 'js-cookie'
import { auth } from '@/firebase/config'
import {router} from "@/main.js"
import axios from 'axios'
import jwt_decode from "jwt-decode";

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  fromAuthProvider,
  signInWithPopup,
  getAuth,
} from 'firebase/auth'
import store from '..'

export default {
    namespace: true,
    // plugins: [
    //     createPersistedState({
    //       key: 'signupKey',  // 設定しなければ'vuex'
    //       paths: ['username','email','email2','country',"UID"],  // 保存するモジュール：設定しなければ全部。
    //       storage: window.sessionStorage,  // 設定しなければlocalStorage
    //     })],
    state: {
        username: '',
        email:'',
        email2:'',
        country:'',
        password:'',
        user: null,
        registeredUser: false,
        // user: null,
        UID:'',
        fasvoriteQuestion:'',
        emailVerified:null,
        authIsReady:false,
        checkedEmail:null,
        accountURL: window.location.origin, 
        actionCodeSettings:{
            url: null,
            handleCodeInApp: true
        },
        tempUser: {
            test: false,
            statusList:'',
            grade:'',
            level:''
        },
        favoriteQuestion:'',
        logger:{
            exist: false,
            actualErrorName:'',
            actualErrorMessage:'',
            message:'',
            path:''
        },
        userInfo:'',
        exceptUserInfo:'',
        beingException:false,
        reloadForException: false,
        apiError:{
            // this is for connection Error
            django: false,
            firebase: false,
            ipinfo: false,
            any: false
        },
        onSigningup:false,
        myQuestion:'',
        myQuizInfo:{
            id:'',
            max:'',
        },
        gradeDict:{
            '超初級':0,
            '初級':10,
            '中級':20,
            '上級':30
        },
        thirdPartylogindata:'',
        thirdPartyError:'',
        photoURL:'',
        countryData:'',
        googleLogin:false,
        tokenError:false,
        accessToken:'',
        refreshToken:'',
        loginError:'',
        quizTakerId:''
    },
    getters:{
        getUID(state){
            return state.UID
        },
        getUser(state){
            return state.user
        },
        getQuizTakerId(state){
            return state.quizTakerId
        },
        getEmailVerified(state){
            return state.emailVerified
        },
        getTempUser(state){
            return state.tempUser
        },
        logger(state){
            return state.logger
        },
        onSigningup(state){
            return state.onSigningup
        },
        getMyQuestion(state){
            return state.myQuestion
        },
        getMyQuizInfo(state){
            return state.myQuizInfo
        },
        quizNameIdInSignup(state, getters, rootState){
            return rootState.quiz.quizNameId
        },
        getUserInfo(state){
            return state.userInfo
        },
        getThirdPartyError(state){
            return state.thirdPartyError
        },
        getPhotoURL(state){
            return state.photoURL
        },
        getTokenError(state) {
            return state.tokenError
        },
        getLoginError(state) {
            return state.loginError
        }
    },
    mutations:{
        getUsername(state,item){
            state.username = item
        },
        getEmail(state,item){
            state.email = item
        },
        getEmail2(state,item){
            state.email2 = item
        },
        getCountry(state,item){
            state.country = item
        },
        getPassword(state,item){
            state.password = item
        },
        setUser(state,payload){
            state.user = payload
            if(state.user){
                state.registeredUser = true
                state.UID = state.user.UID
            }
            console.log('user state changed:',state.user)
        },
        setQuizTakerId(state, payload) {
            state.quizTakerId = payload
            console.log("setQTI", state.quizTakerId)
        },
        setAuthIsReady(state,payload){
            state.authIsReady = payload
            console.log('setauth is changed:',state.user)
        },
        // setuser(state,payload){
        //     state.user = payload
        //     console.log('set Django user',state.user)
        // },
        emailVerifiedHandler(state,payload){
            state.emailVerified = payload
            console.log('emailV chainged',state.emailVerified)
        },
        checkEmailHandler(state,payload){
            state.checkedEmail = payload
        },
        setTempUser(state,payload){
            state.tempUser.test = true
            state.tempUser.statusList = payload.status
            state.tempUser.grade = payload.grade
            state.tempUser.level = payload.level
            console.log('set-temp-user', state.tempUser)
        },
        setTempUserReset(state){
            state.tempUser.test = false
            state.tempUser.statusList = '',
            state.tempUser.grade = '',
            state.tempUser.level = ''
            Cookies.remove('tempKey')
            console.log('reset-TempUser',state.tempUser)
        },
        tempUserTestTrue(state){
            state.tempUser.test = true
        },
        resetQuizKeyStorage(state){
            // this is for log out
            state.UID = null
            state.user = null
            state.emailVerified = null
            state.beingException = false,
            state.reloadForException = false
            state.apiError.django = false
            state.apiError.firebase = false
            state.apiError.ipinfo = false
            state.apiError.any = false
            state.myQuizInfo.id = ''
            state.myQuizInfo.max = ''
            state.myQuestion = ''
            state.registeredUser = false
            console.log('all-Reset')
        },
        setLogger(state,payload){
            state.logger.actualErrorName = payload.actualErrorName
            state.logger.actualErrorMessage = payload.actualErrorMessage
            state.logger.path = 'vue' + payload.path
            state.logger.message = payload.message
            state.logger.exist = true
        },
        resetLogger(state){
            state.logger.actualErrorName = ''
            state.logger.actualErrorMessage = ''
            state.logger.path = ''
            state.logger.message = ''
            state.logger.exist = false
        },
        setUserInfo(state,payload){
            state.userInfo = payload
        },
        checkBeingException(state,payload){
            if(state.user&&!state.user){
                state.beingException = true
                console.log('set-being-exception',state.beingException)
            }
        },
        reloadForExceptionTrueForGeneralApiError(state){
            state.reloadForException = true
            console.log('setRUFEtrue')
        },
        reloadForExceptionTrue(state){
            if(state.user&&!state.user){
                state.reloadForException = true
                console.log('setRUFEtrue')
            }
        },
        reloadForExceptionFalse(state){
            state.reloadForException = false
            console.log('setRUFEfalse')
        },
        handleapiError(state,payload){
            if(payload=='django'){
                state.apiError.django = true
            }
            else if(payload=='firebase'){
                state.apiError.firebase = true
            }
            else if(payload=='ipinfo'){
                state.apiError.ipinfo = true
            }
        },
        checkDjangoError(state,payload){
            if(state.apiError.django){
                router.push({ name: 'ConnectionError' })
            }
            else if(payload=="Network Error"){
                state.apiError.django = true
                state.apiError.any = true
            }else{
                router.push({ name: 'NotFound404' })
            }
        },
        resetDjangoError(state){
            state.apiError.django = false
            state.apiError.any = false
        },
        handleOnSigningup(state){
            state.onSigningup = !state.onSigningup
        },
        deleteMyQuestion(state,payload){
            console.log("before",state.myQuestion,payload)
            state.myQuestion = state.myQuestion.filter(item =>{
                console.log('item',item)
                return (item.question.id !=payload)
            })
            console.log("after",state.myQuestion)
        },
        addMyQuestion(state,payload){
            console.log("before",state.myQuestion,payload)
            state.myQuestion.push(payload)
            console.log("after",state.myQuestion)
        },
        updateQuizTaker(state,payload) {
            state.user.quiz_taker[0].grade = payload.grade
            state.user.quiz_taker[0].level = payload.level
            console.log('set', state.user)
        },
        updateQuizTakerMax(state, payload) {
            // this is for session storage only to reduce API hit
            state.user.quiz_taker[0].max_level = state.user.quiz_taker[0].level
            state.user.quiz_taker[0].max_grade = payload
                    
            console.log('set_max', state.user)
        },
        setTirdPartyloginData(state, payload){
            if(state.tempUser.test){
                console.log('YES TEMP')
                state.userInfo={
                    UID: payload.uid,
                    name: payload.displayName,
                    email: payload.email,
                    quiz_taker: [
                        {grade: state.tempUser.grade},
                        {level: state.tempUser.level},
                    ],
                }
            }else{
                console.log('NO TEMP')
                state.userInfo={
                    UID: payload.uid,
                    name: payload.displayName,
                    email: payload.email,
                }
            }
            // try{
            //     console.log("try",this.userInfo)
            //     this.$store.dispatch('signupuser',this.userInfo)
            // }
            // catch(error){
            //     console.log('error',error.message)
            // }
        },
        setIpData(state, payload){
            state.userInfo['ip_data'] = [{
                city: payload.city,
                ip: payload.ip,
                loc: payload.loc,
                org: payload.org,
                postal: payload.postal,
                region: payload.region,
                timezone: payload.timezone,
                country: payload.country
            }]
            console.log('setIpdata',state.userInfo)
        },
        setPhotoURL(state,payload){
            state.photoURL = payload
        },
        resetPhotoURL(state,payload){
            state.photoURL = ''
        },
        setTokens(state, payload) {
            // console.log("access", jwt_decode(payload.access_token))
            // if(payload.refresh_token){
            //     console.log("refresh", jwt_decode(payload.refresh_token))
            // }
            // Cookies.set('access_token', payload.access_token)
            // Cookies.set('refresh_token', payload.refresh_token)
            state.accessToken =  payload.access_token
            state.refreshToken =  payload.refresh_token
            // document.cookie =  `access_token = ${payload.access_token};secure`
            // document.cookie =  `refresh_token = ${payload.refresh_token};secure`
            console.log("token set",Cookies.get('tokens'))
        },
        cookieDelete(state) {
            state.accessToken = ''
            state.refreshToken = ''
        },
        handleGoogleLogin(state) {
            state.googleLogin = !state.googleLogin
        },
        handleTokenError(state) {
            state.tokenError = !state.tokenError
        },
        setLoginError(state,payload) {
            state.loginError = payload
        }
        // setPayloadForRetryFetch(payload) {
        //     // payload must be array
        //     console.log(Array.isArray(payload))
        //     if (Array.isArray(payload)) {
        //         return {
        //             fun: payload[0],
        //             args: payload[1]
        //         }
        //     } else {
        //         throw("argument must be array")
        //     }
        // }
    },
    actions:{
        async googleLogin(context,payload ){
            console.log("in from login", payload)
            const googleloginConf =
            google.accounts.oauth2.initTokenClient({
                client_id: '510570087121-s5oqfq50nqpmpgcc56jm0g1sid48hvkn.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/userinfo.email',
                // redirect_uri:'http://127.0.0.1:8000/api/user-from/',
                // // ux_mode: 'redirect',
                // ux_mode: 'popup',
                callback: (response) => {context.dispatch("googleloginCallback", response)},
            })
            try{
                googleloginConf.requestAccessToken()
                // throw new Error('could not sent validation')
                // await axios({
                //     method: 'post',
                //     url: '/api/user/',
                //     data: payload
                // })
                // .then(response => {
                //     commit('setuser',response.data)
                // })
                // state.beingException = false
                // commit("resetDjangoError")
                // commit("setTempUserReset")
                // state.userInfo = ''
            }
            catch(e){
                console.log("ERROR",e)
            }
        },
        async googleloginCallback(context, response){
            
            const googleAccessToken = response.access_token
            console.log(googleAccessToken)
            await axios({
                method: 'post',
                url: '/api/user-google/',
                withCredentials: true,
                data: {
                    access_token: googleAccessToken,
                },
                
            })
            .then(async (res) => {
                console.log('res', res)
                context.commit("setTokens", res.data)   
                context.commit('handleGoogleLogin')           
                await context.dispatch("getUserData")
                console.log("dispatch done", context.state.user.quiz_taker[0].id)
                if(context.state.tempUser.test) {
                    const quizTaker = {
                        quiz_taker_id: context.state.user.quiz_taker[0].id,
                        quiz_taker: {
                            grade: context.state.tempUser.grade,
                            level: context.state.tempUser.level,
                            statusList: context.state.tempUser.statusList
                        }
                    }
                    context.dispatch('quizTakerUpdateForInitialization', quizTaker)
                }
            })
            .catch((e) => {
                console.log("EROOR", e)
            })
        },
        async getUserData(context) {
            // const accessToken = await context.dispatch("getAccessTokenFromCookies")
            const accessToken = context.state.accessToken
            console.log("access",accessToken)
            if(accessToken) {
                console.log("acces is true try")
                try{
                    const UID = jwt_decode(accessToken).user_id 
                    if(UID) {
                        await axios.get( `/api/user/${UID}`,{
                            // withCredentials: true,
                            headers: {
                                "Authorization": 'JWT ' + `${accessToken}`,
                                "Content-Type":"aplication/json"
                            }
                        })
                        .then((res) => {
                            context.commit('setUser',res.data)
                            console.log("USER",res.data.is_active)
                            context.commit('emailVerifiedHandler',res.data.is_active)
                            context.commit('setAuthIsReady',true)
                            console.log("login")
                            if(context.state.googleLogin){
                                router.push({ name: 'Account' })
                                context.commit('handleGoogleLogin')
                            }
                        })
                        .catch((e) => {
                            console.log("error",e.response)
                            
                            if(context.dispatch('handleTokenError',e.response.data)) {
                                const newPayload = {
                                    fun: 'getUserData',
                                    args: UID
                                }
                                console.log("self",self.name)
                                context.dispatch('retryFetch',newPayload)
                            } else {
                                return
                            }
                        })
                    }
                } catch {
                    console.log("no decode")
                    context.commit('setAuthIsReady',true)
                }
            } else {
                console.log("notoken")
                context.commit('setAuthIsReady',true)
            }
        },
        async login(context, payload) {

            const email = payload.email
            const password = payload.password
            await axios({
                method: 'post',
                url: '/api/auth/login/',
                withCredentials: true,
                data: {
                    email: email,
                    password: password
                },
                
            })
            .then((res) => {
                const UID = res.data.user.pk
                context.commit('handleGoogleLogin')
                context.commit("setTokens", res.data)                
                context.dispatch("getUserData", UID)

            })
            .catch((e) =>{
                console.log("error", e)
                context.commit('setLoginError',e.response.data)
                // let logger = {
                //     message: "in store/signup.login. couldn't login user",
                //     path: window.location.pathname,
                //     actualErrorName: e.name,
                //     actualErrorMessage: e.message,

                // }
                // context.commit('setLogger',logger)
                // context.commit("checkDjangoError", e.message)
            })       
            
              
        },
        async logout(context){
            try{
                await axios({
                    method: 'post',
                    url: '/api/auth/logout/',
                    withCredentials: true,
                })
                // await signOut(auth)
                context.commit('setUser',null)
                context.commit('resetQuizKeyStorage')
                context.commit('cookieDelete')
                router.push({ name: 'Home' })
            } catch(e) {
                let logger = {
                    message: "in store/signup.logout. couldn't logout",
                    name: window.location.pathname,
                    actualErrorName: e.code,
                    actualErrorMessage: e.message,
                }
                context.commit('setLogger',logger)
                router.push({ name: 'ConnectionError' })
            }
        },
        async GetAccessTokenFromRefreshToken(context) {

            if(context.state.refreshToken) {
                try{
                    await axios({
                        method: 'post',
                        url: '/api/auth/token/refresh/',
                        data: {
                            'refresh':context.state.refreshToken
                        }
                    })
                    .then((res) => {
                        console.log("RF", res)
                        const token = {
                            access_token:res.data.access,
                            refresh_token:res.data.refresh
                        }
                        console.log(token)
                        context.commit("setTokens", token)   
                    })
                }
                catch(e){
                    console.log("E",e)
                    context.commit('setAuthIsReady',true)
                    context.commit("cookieDelete")
                    throw("no valid token")        
                }
            } else {
                console.log("no refreshtoken")
                context.commit('setAuthIsReady',true)
                throw("no valid token")       
            }
            // const cookies = document.cookie.split(';')
            // await context.dispatch('cookieExist',{key:'refresh_token'})
            // .then(async (res) => {
            //     if(res!==undefined){
            //         console.log("refresh_true")
            //         const refresh_token = cookies.map((value) => {
            //             const contentArray = value.split('=')
            //             const isTrue = contentArray.find(e => e.includes('refresh_token'))
            //             if(isTrue) {
            //                 return contentArray[1]
            //             }
            //         }).find(v => v != undefined)
            //         if(refresh_token!=undefined) {
            //             console.log("RT",refresh_token)
            //             try{
            //                 await axios({
            //                     method: 'post',
            //                     url: '/api/auth/token/refresh/',
            //                     data: {
            //                         'refresh':refresh_token
            //                     }
            //                 })
            //                 .then((res) => {
            //                     console.log("RF", res)
            //                     const token = {
            //                         access_token:res.data.access,
            //                         refresh_token:res.data.refresh
            //                     }
            //                     console.log(token)
            //                     context.commit("setTokens", token)   
            //                 })
            //             }
            //             catch(e){
            //                 context.commit('setAuthIsReady',true)
            //                 context.commit("cookieDelete")
            //                 throw("no valid token")        
            //             }
            //         }
            //     } else {
            //         context.commit('setAuthIsReady',true)
            //         throw("no valid token")       
            //     }
            // })                
        },
        getAccessTokenFromCookies(state) {
            // const token = Cookies.get('tokens').accessToken
            return state.accessToken
            // const cookies = document.cookie.split(';')
            // return cookies.map((value) => {
            //     const contentArray = value.split('=')
            //     const isTrue = contentArray.find(e => e.includes('access_token'))
            //     if(isTrue) {
            //         return contentArray[1]
            //     }
            // }).find(v => v != undefined)
        },
        async retryFetch(context, payload) {
            // when get returned invalid token error with access_token, 
            // try to get accesss_token with refresh_token, and try again.
            // the payload must include a function as func you want to retry 
            // and arguments as args for it.
            await context.dispatch("GetAccessTokenFromRefreshToken")
            .then(() => {
                const fun = payload.fun
                const args = payload.args
                context.dispatch(fun,args)
            })
        },
        async emailVerify(context,payload) {
            // console.log("EV",payload)
            // const UID = jwt_decode(payload).user_id 
            // this.$store.commit('setIsLoading', true)
            await axios.post( '/api/email-verify/',{
                withCredentials: true,
                data:payload,
                headers: {
                    "Content-Type":"aplication/json"
                }
            })
            .then(async (res) => {
                console.log("THEN",res)
                if(res.data.verification) {
                    context.commit("setTokens",res.data.tokens)
                    context.dispatch("getUserData")
                    .then(() => {
                      router.push({ name: 'Account' })
                    })
                }  else if(!res.data.verification) {
                    console.log("something went wrong")
                }
            })
            .catch((e) => {
                let logger = {
                    message: "in store/signup.emailVerify. couldn't verify user",
                    path: window.location.pathname,
                    actualErrorName: e.name,
                    actualErrorMessage: e.message,

                }
                console.log('error',e)
                commit('setLogger',logger)
                commit("checkDjangoError", e.message)
                // if("token_not_pass" in e.response.data ) {
                //     console.log("ERR expired",e.response.data.message)
                //     context.commit("handleTokenError")
                // }
            })
            // this.$store.commit('setIsLoading', false)
        },
        async userCreate(context, payload) {
            "payload includes username, email. password"
            // context.commit('setIsLoading', true, {root:true})
            await axios({
                method:"post",
                url: "api/user-create/",
                data: payload
            })
            .then(res => {
                // context.commit('setIsLoading', false, {root:true})
                console.log("create_user",res.data.quiz_taker_id)
                context.commit('setQuizTakerId',res.data.quiz_taker_id)
            })
            .catch((e) =>{
                context.commit('setIsLoading', false, {root:true})
                let logger = {
                    message: "in store/signup.userCreate. couldn't create user",
                    path: window.location.pathname,
                    actualErrorName: e.name,
                    actualErrorMessage: e.message,

                }
                console.log('error',e)
                context.commit('setLogger',logger)
                context.commit("checkDjangoError", e.message)
            })            
        },
        async quizTakerUpdateForInitialization(context, payload){
            
            console.log("quiz_taker_update", payload)
            await axios({
                method: 'post',
                url: '/api/quiz-taker-update/',
                withCredentials: true,
                data: {
                    quiz_taker_id: payload.quiz_taker_id,
                    quiz_taker: payload.quiz_taker

                },
                
            })
            .then((res) => {
                context.commit('setTempUserReset')
                console.log("respone",res)
            })
            .catch((e) => {
                console.log("EROOR", e)
            })
        },
        async SendChangePassword(context, payload) {
            await axios.post( '/api/user-send-password-change/',{
                withCredentials: true,
                data: payload,
                headers: {
                    "Content-Type":"aplication/json"
                }
            })
            .then(async (res) => {
                console.log("THEN",res)

            })
            .catch((e) => {
                let logger = {
                    message: "in store/signup.password_reset. couldn't change password",
                    path: window.location.pathname,
                    actualErrorName: e.name,
                    actualErrorMessage: e.message,

                }
                console.log('error',e)
                commit('setLogger',logger)
                commit("checkDjangoError", e.message)
                // if("token_not_pass" in e.response.data ) {
                //     console.log("ERR expired",e.response.data.message)
                //     context.commit("handleTokenError")
                // }
            })
            // this.$store.commit('setIsLoading', false)
        },
        // async changePassword(context, payload) {
        //     await axios.post( '/api/user-password-change/',{
        //         withCredentials: true,
        //         data: payload,
        //         headers: {
        //             "Content-Type":"aplication/json"
        //         }
        //     })
        //     .then(async (res) => {
        //         console.log("THEN",res.data.password_change)
        //         if(res.data.password_change) {
        //             context.commit("setTokens",res.data.tokens)
        //             context.dispatch("getUserData")
        //             .then(() => {
        //                 router.push({ name: 'Account' })
        //             })   
        //         } else {
        //             console.log("not change")
        //         }
        //     })
        //     .catch((e) => {
        //         let logger = {
        //             message: "in store/signup.password_reset. couldn't change password",
        //             path: window.location.pathname,
        //             actualErrorName: e.name,
        //             actualErrorMessage: e.message,

        //         }
        //         console.log('error',e)
        //         commit('setLogger',logger)
        //         commit("checkDjangoError", e.message)
        //         // if("token_not_pass" in e.response.data ) {
        //         //     console.log("ERR expired",e.response.data.message)
        //         //     context.commit("handleTokenError")
        //         // }
        //     })
        //     // this.$store.commit('setIsLoading', false)
        // },
        handleTokenError(context, payload) {
            if(payload.message==="Your token is expired") {
                debugger
                return true
            } else {
                return false
            }
        },
        // cookieExist(context, payload) {

        //     const cookies = document.cookie.split(';')
        //     console.log("COOkies",cookies)
        //     const key = payload.key
        //     console.log("key",key)
        //     const result = cookies.map((value) => {
        //         const contentArray = value.split('=')
        //         return contentArray.find(e => e.includes(key))
                
        //     }).find(v => v != undefined)
        //     console.log("PAY",payload)
        //     if('delete' in payload){
                 
        //     }
        //     console.log("result", result)
        //     return result === key
        // },
        cookieDelete(context, payload) {
            // this execute after cookieExist
            // Cookies.remove('tokens')
            // const cookies = document.cookie.split(';')
            // const key = payload.key
            // const isArray = Array.isArray(key)
            // const del = (arg) => {
            //     return cookies.map((value) => {
            //         const contentArray = value.split('=')
            //         const isTrue = contentArray.find(e => e.includes(arg))
            //         if(isTrue) {
            //             document.cookie = `${arg} = ${contentArray[1]};max-age=0`
            //             return {"deleted": true}
            //         } else {
            //             return {"deleted": false}
            //         }
            //     }).find(v => v != undefined)
            // }
            // if(!isArray) {
            //     return del(key)
            // } else {
            //     const result = key.map((k) => {
            //         const deleted = del(k)
            //         return deleted.deleted ? deleted : undefined
            //     }).find(v => v != undefined)
            //     return result
            // }
        },
        async signupuser( {state, commit},payload ){
            console.log("INSDU",payload)
            try{
                // throw new Error('could not sent validation')
                await axios({
                    method: 'post',
                    url: '/api/user/',
                    data: payload
                })
                .then(response => {
                    commit('setuser',response.data)
                })
                state.beingException = false
                commit("resetDjangoError")
                commit("setTempUserReset")
                state.userInfo = ''
            }
            catch(e){
                state.userInfo = payload
                let logger = {
                    message: "in store/signup.Signupuser. couldn't signup django user",
                    path: window.location.pathname,
                    actualErrorName: e.name,
                    actualErrorMessage: e.message,

                }
                console.log('error',e)
                commit('setLogger',logger)
                commit("checkDjangoError", e.message)
            }
        },
        async signupuserForException( {state, commit},payload ){
            // this is only for unsub below. dont use other part
            console.log("INSDUFX")
            if(!state.user&&state.beingException){
                if(state.userInfo){
                    try{
                        // throw new Error('could not sent validation')
                        await axios({
                            method: 'post',
                            url: '/api/user/',
                            data: state.userInfo
                        })
                        .then(response => {
                            commit('setuser',response.data)
                        })
                        state.beingException = false
                        commit('resetDjangoError')
                        commit("setTempUserReset")
                        state.userInfo = ''
                    }
                    catch(e){
                        console.log('catchdayo',e.message)
                        commit("checkDjangoError", e.message)
                        let logger = {
                            message: "in store/signup.SignupuserException1. couldn't signup django user",
                            name: window.location.pathname,
                            actualErrorName: e.name,
                            actualErrorMessage: e.message,
                        }
                        commit('setLogger',logger)
                        commit("checkDjangoError", e.message)
                    }
                }
                else{
                    try{
                        console.log('NO TEMP')
                        await axios
                        .get("https://ipinfo.io/json?token=32e16159d962c5")
                        .then(response => {
                            let IP = response.data
                            state.exceptUserInfo = {
                                UID: state.user.uid,
                                name: '名前を変更しよう',
                                email: state.user.email,
                                ip_data: [{
                                    city: IP.city,
                                    ip: IP.ip,
                                    loc: IP.loc,
                                    org: IP.org,
                                    postal: IP.postal,
                                    region: IP.region,
                                    timezone: IP.timezone,
                                    country: IP.country
                                }]
                            } 
                        })
                    }
                    catch(e){
                        commit("checkDjangoError", e.message)
                        let logger = {
                            message: "in store/signup.SignupuserException2. couldn't signup django user",
                            path: window.location.pathname,
                            actualErrorName: e.name,
                            actualErrorMessage: e.message,
                        }
                        commit('setLogger',logger)
                        router.push({ name: 'NotFound404' })
                    }
                     
                    try{
                        console.log('try non_userINFO',state.exceptUserInfo)
                        // throw new Error('could not sent validation')
                        await axios({
                            method: 'post',
                            url: '/api/user/',
                            data: state.exceptUserInfo
                        })
                        state.beingException = false
                        commit("resetDjangoError")
                    }
                    catch(e){
                        commit("checkDjangoError", e.message)
                        let logger = {
                            message: "in store/signup.SignupuserException3. couldn't signup django user",
                            path: window.location.pathname,
                            actualErrorName: e.name,
                            actualErrorMessage: e.message,
                        }
                        commit('setLogger',logger)
                        router.push({ name: 'NotFound404' })
                    }
                }   
            }
        },
        async signupuserForThirdParty( {state, commit, dispatch},payload ){
            console.log("INSDUTH",payload)
            try{
                await axios({
                    method: 'post',
                    url: '/api/user/',
                    data: payload,
                })
                .then(response => {
                    if(response.status==222){
                        console.log('response222')
                        commit('resetPhotoURL')
                        commit('setuser',response.data)
                    }else{
                        commit('setuser',response.data)
                    }
                })
                // state.beingException = false
                commit("resetDjangoError")
                commit("setTempUserReset")
                // await dispatch("patchImage")
                state.userInfo = ''
            }
            catch(e){
                // console.log('e',e,e.response.data)
                // if(e.response.data = 'user-exists-django'){
                //     state.thirdPartyError = e.response.data;
                //     state.userInfo = payload
                // }
                // else{
                let logger = {
                    message: "in store/signup.SignupuserFoeThirdParty. couldn't signup django user",
                    path: window.location.pathname,
                    actualErrorName: e.name,
                    actualErrorMessage: e.message,
                }
                console.log('error',e)
                commit('setLogger',logger)
                commit("checkDjangoError", e.message)
                // }
            }
        },
        // async getToken() {
        //     await 
        //     axios
        //     // fetch("http://127.0.0.1:8000/api/csrf/")
        //     //     .then((res) => {
        //     //         console.log("res",res.headers.get("X-CSRFToken"))
        //     //     })
        //         .get(`/api/csrf`,{ withCredentials: true })
        //         .then(response => {
                    
        //             console.log("MOMO",response)
        //         })
        //         .catch((err) => {
        //             console.log(err)
        //         })
        // },
        async getuser({ state, commit}){
            // commit('setIsLoading', true, {root:true})
            if(state.user&&!state.beingException){
                console.log('GDU_pass',state.beingException)
                try{
                    await axios
                    .get(`/api/user/${state.user.uid}`,{ withCredentials: true })
                    .then(response => {
                        commit('setuser',response.data)
                        state.myQuestion = response.data.my_quiz[0].my_question
                        state.myQuizInfo.id = response.data.my_quiz[0].id
                        state.myQuizInfo.max = response.data.my_quiz[0].max_num
                        console.log("MQ",state.myQuestion)
                    })
                    commit("resetDjangoError")
                }
                catch(e){
                    console.log('catch')
                    let logger = {
                        message: "in store/signup.getuser. couldn't signup django user",
                        path: window.location.pathname,
                        actualErrorName: e.name,
                        actualErrorMessage: e.message,
                    }
                    commit('setLogger',logger)
                    commit("checkDjangoError", e.message)
                }
            }
            // commit('setIsLoading', false, {root:true})
        },
        async getFavoriteQuestion({ state, commit }){
            state.favoriteQuestion = null
            if(state.user&&state.user.favorite_question.length){
                const questionId = []
                for(let i of state.user.favorite_question[0].question){
                    console.log('GFQQQQQ',i)
                    questionId.push(i)
                }
                if(questionId[0]){
                    await axios
                    .get(`/api/board/question-favorite?question_id=${questionId}`)
                    .then(response => {
                        state.favoriteQuestion = response.data
                        })
                    .catch(e => {
                        let logger = {
                            message: "in store/signup.getFavoriteQuestion. couldn't get favoriteQuestion ",
                            path: window.location.pathname,
                            actualErrorName: e.name,
                            actualErrorMessage: e.message,
                        }
                        commit('setLogger',logger)
                        commit("checkDjangoError", e.message)
                    
                    })
                }
            }
        },
        // async getCountryData({ state, commit,dispatch }){
        //     // commit('setIsLoading', true, {root:true})
        //         console.log('country')
        //         try{
        //             await fetch('@/vue_front/src/assets/country.json')
        //             .then(response => {
        //                 console.log('res',response.data)
        //             })
        //         }
        //         catch(e){
        //             console.log('catch',e)
        //             // let logger = {
        //             //     message: "in store/signup.getuser. couldn't signup django user",
        //             //     name: window.location.pathname,
        //             //     actualErrorName: e.name,
        //             //     actualErrorMessage: e.message,
        //             // }
        //             // commit('setLogger',logger)
        //             // commit("checkDjangoError", e.message)
        //         }
            
        // },
        // async signup(context, {email,password}){
        //     console.log('signup in')
        //     try {
        //         const ref = await createUserWithEmailAndPassword(auth, email, password)
        //         context.state.actionCodeSettings['url'] = context.state.accountURL
        //         sendEmailVerification(ref.user,context.state.actionCodeSettings)
        //         context.commit('setUser',ref.user)
        //         context.commit('emailVerifiedHandler',ref.user.emailVerified)
        //         console.log('signup is done',auth.currentUser)
        //     }catch(e){
        //         let logger = {
        //             message: "in store/signup.signup. couldn't signup firebase user",
        //             name: window.location.pathname,
        //             actualErrorName: e.code,
        //             actualErrorMessage: e.message,
        //         }
        //         context.commit('setLogger',logger)
        //         router.push({ name: 'NotFound404' })
        //     }
        // },
        // async fromlogin(context){
        //     const provider = new fromAuthProvider();
        //     const auth = getAuth();
        //     signInWithPopup(auth, provider)
        //     .then((result) => {
        //         // This gives you a from Access Token. You can use it to access the from API.
        //         const credential = fromAuthProvider.credentialFromResult(result);
        //         const token = credential.accessToken;
        //         // The signed-in user info.
        //         context.commit('setPhotoURL',result.user.photoURL)
        //         context.commit('setUser',result.user)
        //         context.commit('emailVerifiedHandler',result.user.emailVerified)
        //         context.commit('setTirdPartyloginData',result.user)
        //         context.dispatch('getIpData')
        //     }).catch((e) => {
        //         console.log(e.code)
        //         if(e.code == 'auth/popup-closed-by-user'||'auth/cancelled-popup-request') {
        //             return 
        //         }
        //         let logger = {
        //             message: "in store/signup.fromlogin. couldn't login firebase user",
        //             name: window.location.pathname,
        //             actualErrorName: e.code,
        //             actualErrorMessage: e.message,
        //         }
        //         context.commit('setLogger',logger)
        //         router.push({ name: 'ConnectionError' })
        //         // Handle Errors here.
        //         const errorCode = e.code;
        //         const errorMessage = e.message;
        //         // The email of the user's account used.
        //         const email = e.email;
        //         // The AuthCredential type that was used.
        //         const credential = fromAuthProvider.credentialFromError(e);
        //         // ...
        //     });
        // },
        // async sendEmailVerify(context){
        //     context.state.actionCodeSettings['url'] = context.state.accountURL
        //     console.log('sendEmail',context.state.user,context.state.actionCodeSettings)
        //     await sendEmailVerification(context.state.user,context.state.actionCodeSettings)
        // },
        // async sentValidation(context){
        //     console.log('insentV')
        //     try{
        //         await context.state.user.sendEmailVerification()
        //     }catch(e){
        //         let logger = {
        //             message: "in store/signup.sendEmailVerify. couldn't send EmailVerify",
        //             name: window.location.pathname,
        //             actualErrorName: e.code,
        //             actualErrorMessage: e.message,
        //         }
        //         context.commit('setLogger',logger)
        //         router.push({ name: 'ConnectionError' })
        //     }
        // },
        // async login(context, {email,password}){
        //     // context.commit('setIsLoading', true, {root:true})
        //     console.log('in_login')
        //     try{
        //         var ref = await signInWithEmailAndPassword(auth, email, password)
        //     }catch (e){
        //         let logger = {
        //             message: "in store/signup.login. couldn't login from-account",
        //             name: window.location.pathname,
        //             actualErrorName: e.code,
        //             actualErrorMessage: e.message,
        //         }
        //         context.commit('setLogger',logger)
        //         router.push({ name: 'ConnectionError' })
        //     }
        //     if(ref){
        //         console.log("IF YES")
        //         context.commit('setUser',ref.user)
        //         context.dispatch('getuser')
        //         context.commit("setTempUserReset")
        //         context.commit('emailVerifiedHandler',ref.user.emailVerified)
        //         console.log(context.state.user,context.state.emailVerified)
        //     }else{
        //         let logger = {
        //             message: "in store/signup.login. couldn't login from-account",
        //             name: window.location.pathname,
        //             actualErrorName: '',
        //             actualErrorMessage: '',
        //         }
        //         context.commit('setLogger',logger)
        //         router.push({ name: 'ConnectionError' })
        //     }
        //     // context.commit('setIsLoading', false, {root:true})                
        // },
        async checkEmail(context,email){
            console.log("ML",email)
            try {
                const result = await axios({
                    method: 'post',
                    url: '/api/user-exists/',
                    data: {
                        "email": email,

                    },
                })
                .then(res => {return res.data})
                console.log(result)
                if (result.exists){
                    context.commit('checkEmailHandler',false)
                    console.log('already in use')
                }else{
                    context.commit('checkEmailHandler',true)
                    console.log('you can use it')
                }
            }catch(e){
                console.log(e)
                let logger = {
                    message: "in store/signup.checkEmail. couldn't check Email",
                    name: window.location.pathname,
                    actualErrorName: e.code,
                    actualErrorMessage: e.message,
                }
                // context.commit('setLogger',logger)
                // router.push({ name: 'ConnectionError' })
            }
        },
        async passwordReset(context,email){
            console.log('passreset action',email)
            try{
                context.state.actionCodeSettings['url'] = context.state.accountURL
                await sendPasswordResetEmail(auth,email,context.state.actionCodeSettings)
            console.log('password reset sent')
        }catch(e){
            let logger = {
                message: "in store/signup.passwordReset. couldn't sent pass reset",
                name: window.location.pathname,
                actualErrorName: e.code,
                actualErrorMessage: e.message,
            }
            context.commit('setLogger',logger)
            router.push({ name: 'ConnectionError' })
            }
        },
        
        updateQuizTakerAction({state, commit, getters},payload){
            console.log('inUQTA',getters)
            commit('updateQuizTaker',payload);
            console.log('UPaction',getters.quizNameIdInSignup)
            for(let i of getters.quizNameIdInSignup){
                if(i.id == payload.grade){
                    if(state.gradeDict[state.user.quiz_taker[0].max_grade] < state.gradeDict[i.name]){
                        commit('updateQuizTakerMax',i.name);
                        break
                    }
                    else if(state.gradeDict[state.user.quiz_taker[0].max_grade] == state.gradeDict[i.name]){
                        if(state.user.quiz_taker[0].max_level < payload.level){
                            commit('updateQuizTakerMax',i.name);
                            break
                        }
                    }
                }
            }
        },
        async getOrSignupuserForThirdParty(context){
            await context.dispatch('signupuserForThirdParty',context.getters.getUserInfo)
            router.push({ name: 'Account' })
        },
        async getIpData(context){
            await axios
            .get("https://ipinfo.io/json?token=32e16159d962c5")
            .then(response => {
                context.commit('setIpData',response.data)
                context.dispatch('getOrSignupuserForThirdParty')
                
            })
            .catch((e) => {
                let logger = {
                    message: "in store/signup.getIpData. couldn't get ip-data",
                    name: window.location.pathname,
                    actualErrorName: e.code,
                    actualErrorMessage: e.message,
                }
                context.commit('setLogger',logger)
                router.push({ name: 'ConnectionError' })
            });
        },
        async createLog(context,payload){
            if(context.state.logger.exist) {
                await axios
                .post('/api/loggers-create',{
                    message: payload.message,
                    path: payload.path,
                    actualErrorName: payload.actualErrorName,
                    actualErrorMessage: payload.actualErrorMessage,
                })
                .catch((e) => {
                    let logger = {
                        message: "in store/signup.createLog. couldn't create log",
                        name: window.location.pathname,
                        actualErrorName: e.code,
                        actualErrorMessage: e.message,
                    }
                    context.commit('setLogger',logger)
                    router.push({ name: 'ConnectionError' })
                });
                context.commit('resetLogger')
            }
        },
        // async patchImage(context){
        //     var list = context.getters.getuser.thumbnail.split('/')
        //     console.log('list',list)
        //     if(list.includes('default.png')&&context.getters.getPhotoURL){
        //         console.log('png');
        //         const blob = await fetch(this.getPhotoURL).then(r => r.blob());
        //         const headers = { "content-type": "multipart/form-data" };
        //         const formData = new FormData();
        //         formData.append('thumbnail',blob,`${blob}.png`)
        //         console.log('getthumb',formData.get('thumbnail'),formData),
        //         axios.patch(`/api/user/${context.getters.getuser.UID}`,
        //             formData,
        //             {headers}
        //         )
        //     }
        // },
        aurhStatusChange(context) {
            context.commit('setAuthIsReady',true)
        }
    }
}
// const unsub = onAuthStateChanged(auth,(user) =>{
//     store.commit('setAuthIsReady',true)
//     store.commit('setUser',user)
//     console.log('unsub',user)
//     store.dispatch('createLog')
//     // store.dispatch('getToken')
//     if(user){
//         store.dispatch('getuser')
//         store.commit('emailVerifiedHandler',user.emailVerified)
//         store.dispatch('signupuserForException')
//     }else{
//         store.commit('resetQuizKeyStorage')
//     }
//     unsub()
// })