<template>
  <div class="verification">
    <div class="is-loading-bar has-text-centered" v-bind:class="{'is-loading': $store.state.isLoading }">
      <div class="lds-dual-ring"></div>
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
      tokenError: false
    }
  },
  mounted(){
    this.emailVerify()
    console.log("mounted EMAIL",this.token)

  },
  methods:{
    emailVerify() {
      this.$store.dispatch("emailVerify", this.token)
    }
    
    }
    
}
</script>

<style>
.verification{
    height:100vh;
}
</style>