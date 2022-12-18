<template>
    <div class="password-wrapper" :class="{'laoding-center':$store.state.isLoading}">
        <form v-if="!$store.state.isLoading" class="id-form" @submit.prevent='submitForm' >
            <div class="is-loading-bar has-text-centered" v-bind:class="{'is-loading': $store.state.isLoading }">
                <div class="lds-dual-ring"></div>
            </div>
            <div class='field-wrapper'>
                <p class='password-text'>パスワード変更</p>
                <div class="field">
                    <div class="input-box" ref='pass'>
                        <i class="fas fa-unlock-alt" id='in-font'><input required autocomplete class="text-box" :type="inputType" v-model='password' placeholder="Password"></i>
                        <i :class="[passType ? 'fas fa-eye':'fas fa-eye-slash']" id='eye' @click='click' ></i>
                    </div>      
                </div>
                <div class="field">
                    <div class="input-box">
                        <i class="fas fa-unlock-alt" id='in-font'><input required autocomplete class="text-box" :type="inputType2" v-model='password2' placeholder="Conf Password"></i>
                        <i :class="[passType2 ? 'fas fa-eye':'fas fa-eye-slash']" id='eye' @click='click2' ></i>
                    </div>          
                </div>
            </div>
            <div class='error-form' v-if='passwordError||passwordError2'>
                <i class="fas fa-exclamation-triangle"></i>
                <div v-if='passwordError' >{{ passwordError }}</div> 
                <div v-if='passwordError2'>{{ passwordError2 }}</div>
            </div>    
            <div>
                <button class='fbottun' ref='bform'>送信</button>
            </div>
        </form>
        <AbstractModal
        v-if="tokenNotExist"
        :modalMessage='modalMessage'
        
        />
    </div>
</template>

<script>
import axios from 'axios'
import {router} from "@/main.js"
import AbstractModal from '@/components/parts/AbstractModal.vue'

export default {
    components:{
        AbstractModal
    },
    data(){
        return{
            token:this.$route.params.token,
            tokenNotExist:'',
            password:'',
            password2:'',
            accept:'',
            showButton:true,
            passwordError:'',
            passwordError2:'',
            passType:true,
            passType2:true,
            modalMessage:"エラーが発生しました。最新のパスワード変更メールを確認してください。",
            modalFunctionMessage:"パスワード変更メールをもう一度送りますか。",
            modalFunction:() => this.$store.dispatch('SendChangePassword',this.email)
        }
    },
    mounted(){
        this.checkTokenExist()
        this.$emit('handle')
        this.$store.commit('handleOnSigningup')
    },
    beforeUnmount(){
        this.$store.commit('handleOnSigningup')
        this.tokenNotExist = false
    },
    updated(){
        this.showButtonHandler()
    },
    computed: {
    inputType: function () {
      return this.passType ? "password":"text";
        },
    inputType2: function () {
      return this.passType2 ? "password":"text";
        }
    },
    watch:{
        showButton:function(v) {if (v == false) { this.$refs.bform.classList.add('button-hover')}
        else{this.$refs.bform.classList.remove('button-hover')}},
        passwordError:function(v) {if (v != '') { this.$refs.pass.classList.add('form-error')}
        else{this.$refs.pass.classList.remove('form-error')}},
    },
    methods:{
        showButtonHandler(){
            if(this.password!=''&&this.password2!=''){
                this.showButton = false
                }
            else{
                this.showButton = true
                }
            },
        submitForm(){
            // validate password
            this.passwordError = this.password == this.password2?
            '' : '@passwords are not the same'
            this.passwordError2 = this.password.length > 7?
            '' : '@password is less than 8 char'
            if (this.passwordError == ''&&this.passwordError2 == ''){
                this.changePassword({
                    token: this.token,
                    password: this.password
                })    
            }
        },
        click(){
            this.passType = !this.passType
        },
        click2(){
            this.passType2 = !this.passType2
        },
        async checkTokenExist(){
            console.log("tokencheck")
            this.$store.commit('setIsLoading', false)
            await axios("/api/token-check/",{
                method: "post",
                data: {"token":this.token}
            })
            .then((res) => {
                this.$store.commit('setIsLoading', false)
                console.log("DATA",res.data)
                if(!res.data.exist) {
                    this.tokenNotExist= true
                    console.log("NO_TOKEN_MUTCH", this.tokenNotExist)
                }
            })
            .catch(e => {
                console.log(e)
            })
        },
        async changePassword(payload) {
            await axios.post( '/api/user-password-change/',{
                withCredentials: true,
                data: payload,
                headers: {
                    "Content-Type":"aplication/json"
                }
            })
            .then(async (res) => {
                console.log("resPass", res)
                this.modalMessage = "パスワードの変更が完了しました。アカウントページへ移動します。"
                this.tokenNotExist= true
                if(res.data.password_change) {
                    this.$store.commit("setTokens",res.data.tokens)
                    this.$store.dispatch("getUserData")
                    .then(() =>{
                        console.log("GET")
                         setTimeout(() =>{
                            console.log("SET")
                            router.push({ name: 'Account' })
                        },2000)
                    })
                } else {
                    console.log("not change")
                    this.modalMessage = "パスワードの変更ができませんでした。もう一度やり直してください。"
                    this.tokenNotExist= true
                    router.push({ name: 'Login' })
                }
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
            })
        },
        handleTokenError(context, payload) {
            if(payload.message==="Your token is expired") {
                debugger
                return true
            } else {
                return false
            }
        },
    }
        
}
</script>

<style scoped lang='scss'>
@import "style/_variables.scss";
    .password-wrapper{
        width:100vw;
        min-height: 100px;
        flex-direction: column;
        align-items: flex-start;;
        display: flex;
        position: absolute;
        align-items: center;
        margin-top: 100px;
        }
    .password-text{
        color:white;
        font-size:1.2rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
       
    }
    .field-wrapper{
        margin-top:3rem;
    }
    .field{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .label{
        color:white;
        width: 2.7rem;
        overflow-wrap: break-word;
        margin-right:1%;
        line-height:1rem
    }.label:not(:last-child) {
        margin-bottom: initial;
}
    input[type="password"]:focus {
        outline: none;
        }
        .input-box:focus-within{
        border: solid $base-color;
        
        }
    .input-box{
        border: 0.12rem solid $base-color;
        border-radius: 100vh;
        background: $back-white;
        width: 17rem;
        height: 3rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position:relative;
        
    }#in-font{
        margin-left:0.5rem;
        color:rgb(158, 158, 158); 
        transition:0.3s;
        position:relative;
    }
    #in-font:focus-within{
        color:rgb(92, 92, 92);

    }
    .form-error{
        border: solid red;
      }
    .text-box{
        width: 14rem;
        border:none;
        background: $back-white;
        margin-left:0.5rem;
        position:absolute;
        left:1rem;
    }
    .check-box-wrapper{
        margin-top: 1.5rem;
        cursor: move;
        border: solid transparent;
        transition: .5s;
        
    }
    .check-box-wrapper:hover{
        border: solid $lite-gray;
    }
    #eye{
        position:absolute;
        right:0;
        margin-right:0.5rem;
        color:rgb(158, 158, 158);
        transition:0.3s;
    }
    #eye:hover{
        color:rgb(92, 92, 92);
    }
    #eye:focus-within{
        color:rgb(92, 92, 92);
    }
    .select-box{
        width: 82%;
        border:none;
        background: $back-white;
        margin-left:0.5rem;
    }
    
    .check-box-text{
        color:white;
        margin-left:1rem;
    }
    .error-wrapper{
        width: 100%;
        height:5rem;
    }
    .error-form{
        margin-top: 1rem
    }
</style>