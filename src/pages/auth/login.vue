<template>
        <div class="grid justify-content-center p-2 lg:p-0" style="min-width:80%">
            <div class="col-12 mt-5 xl:mt-0 text-center"></div>
                <div class="col-12 xl:col-4 m-0 py-7 px-16" style="border-radius:6px; background: linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0));">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">{{ titleCompany }}</div>
                        <span class="text-600 font-medium"> 
						  <router-link to="/auth/register" class="">Регистрация
						  </router-link>
						</span>
                    </div>
                
                    <div class="w-full md:w-10 mx-auto">
                        <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" v-model="state.email" type="text" class="w-full mb-3" placeholder="Логин" style="padding:1rem;" />					
            
                        <label for="password" class="block text-900 font-medium text-xl mb-2">Пароль</label>
                        <Password id="password" v-model="state.password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle='inputStyle'></Password>
                        <!--label for="role" class="block text-900 font-medium text-xl mb-2">Роль</label-->
                        <Dropdown v-model="state.role" :options="roles" optionLabel="name" placeholder="Роль" class="w-full mb-3" /> 
                
                        <div class="flex align-items-center justify-content-between mb-5">
                            <div class="flex align-items-center">
                                <!--Checkbox id="rememberme1" v-model="checked" :binary="true" class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label-->
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Забыли пароль?</a>
                        </div>
                        <Button label="Войти" class="w-full p-3 text-xl" @click="actionLogin" autofocus />
                    </div>
                </div>
            </div>


</template>
<script async setup lang='ts'>
import { ref, reactive, onMounted, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFetch } from '~/composables/fetch'

const router = useRouter()
const route = useRoute()

const isTest = ref(import.meta.env.VITE_TEST) || false
const titleCompany = ref(import.meta.env.VITE_COMPANY) || null
const inputStyle = ref({
  padding: '1rem'
})
const urls = {
  login: `${import.meta.env.VITE_API_URL}/auth/token/`
}

const state = reactive({
  id:null,
  firstname:null,
  lastname:null,  
  email:'',
  password:null,
  patronymic:null,
  token:null,
  role: null,
})

const roles = [
    //{code: 'customer' name: 'Клиент', },  
    {code: 'customer', name: 'Клиент', },
    {code: 'deliver', name: 'Курьер', },	
    {code: 'manager', name: 'Менеджер', },
    {code: 'support', name: 'Поддержка', },	
]

const init = () => {

}

onMounted(
  () => { init() }
)

const actionLogin = async () => {
  state.email = 'admin@admin.com'
  state.password = 'admin'  
  const {data: result, error} = useFetch({
    method: 'POST',
    url: urls.login,
	headers: {
	  "Content-Type": 'application/json',
	},
	body: JSON.stringify({
	  email: state.email, 
	  password: state.password,
	}) 
  })
  watchEffect(async () => {
   if(result.value) {  
	if(result.value?.non_field_errors) {
	  console.log('Server error')
	  return 
	}
	console.log('login',result.value)
    state.token = result.value.access
	$cookies.set('userState',state)
	console.log('auth',$cookies.get('userState'))	
	router.push('/')

   }
  })
}

const submit = async (event) => {
  console.log('submit',event)
  if(!state.password || state.password.length < 3) return
  if(!state.username || state.username.length < 3) return
  actionLogin()
}

</script>
<route lang="yaml">
meta:
  layout: home
</route>