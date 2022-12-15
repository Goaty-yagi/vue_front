<template>
  <div class="verification" :class="{'scroll-fixed':fixedScroll, 'laoding-center':$store.state.isLoading}">
    <div>
      <div class="is-loading-bar has-text-centered">
      <div class="lds-dual-ring"></div>
    </div>
    <div v-if="tokenError">
      <div class="account-wrapper l-wrapper">
        <div class="main-wrapper">
            <div class='main-notification-wrapper'>
                <div class='main-notice-wrapper'>
                    <div class="close-container">
                        <div class="close">
                            <i class="fas fa-times"></i>
                        </div>
                    </div>
                    <img class='main-image' src="@/assets/logo.png">
                    <div v-if="!sent">
                        <p class='main-text1'>時間切れのためメール承認ができませんでした。</p>
                        <p class='main-text1'>メールを受け取ってから10分以内にメール承認を完了してください。</p>
                    </div>
                    <div v-if="sent">
                        <p class='main-text1'>承認メールを送信しました。</p>
                        <p class='main-text1'>登録したアドレスで確認してください。</p>
                    </div>
                    <button v-if="!sent" @click='resend' onclick="disabled = true" class='btn-gray-black-gray-sq'>承認メールを送る</button>                      
                </div>
            </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
// import {mapGetters,mapActions} from 'vuex'
import axios from 'axios'
import {router} from "../main.js"
export default {
  name:'questions',
  data(){
    return{
      token:this.$route.params.token,
      tokenError: false,
      fixedScroll: false,
      sent: false
    }
  },
  mounted(){
    this.emailVerify()
    console.log("mounted EMAIL",this.token)

  },
  beforeUnmount(){
        this.$store.commit('fixedScrollFalse')
        this.$store.commit('showModalFalse')
    },
  methods:{
    async emailVerify() {
      this.$store.commit('setIsLoading', true)
      await this.$store.dispatch("emailVerify", this.token)
        .then(() => {
          if(this.$store.getters.getTokenError) {
            this.tokenError = true
            this.$store.commit('fixedScrollTrue')
            this.fixedScroll = this.$store.getters.fixedScroll
            this.$store.commit('showModalTrue')
            this.$store.commit('handleTokenError')
          }
          this.$store.commit('setIsLoading', false) 
        })
      },
      resend() {
        this.sent = true
      }
    }
}
</script>

<style lang="scss" scoped>
@import "style/_variables.scss";

.verification{
    max-height:100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.account-wrapper{
    // height: 100%;
    width: 100%;
    .main-wrapper{
        display: flex;
        justify-content: center;
    }
}
.btn-gray-black-gray-sq{
    margin-bottom: 2rem;
    font-size: 1.2rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
}
img{
    margin-top: 1.5rem;
    cursor: pointer;
}
.main-notification-wrapper{
    display: flex;
    justify-content: center;
    align-items: center;
    // min-height: 100%;
    width: 100%;
}
    .main-notice-wrapper{
        border: solid $base-color;
        border-radius: 2vh;
        background:$back-white;
        text-align: center;       
        position:relative;
        // padding-top:1.5rem;
        width: 80%;
        min-height: 120%;
    }
    .main-image{
        width:15%;
        height:auto;
        margin-left: auto;
        margin-right: auto;
    }
    .main-text1{
        font-size:1.4rem;
        font-weight: bold;
        margin:2rem;
    }
</style>
