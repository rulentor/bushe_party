<script setup>
import { FilterMatchMode } from 'primevue/api'
import { ref, onMounted, onBeforeMount } from 'vue'
import ProductService from '~/service/ProductService'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const profiles = ref(null)
const profile = ref({})

const showDialog = ref(false)
const createDialog = ref(false)
const profileDialog = ref(false)
const deleteDialog = ref(false)
const deleteItemsDialog = ref(false)

const selectedProfiles = ref(null)
const dt = ref(null)
const filters = ref({})
const submitted = ref(false)

const urls = {
  listOrders: `${import.meta.env.VITE_API_URL}/api/order/`,
  listProfiles: `${import.meta.env.VITE_API_URL}/auth/`,
}

const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
])

const state = reactive({
  id: null,
  status: 'waiting',
  price: 0,
  payment:0,
  weigth: 0.0,
  duration: '', //datetime
  composition: [],
  location: [
    {address: '', latitude:'', longitude:''},
	{address: '', latitude:'', longitude:''},
  ]
})

const stateProfile = reactive({
  id: null,
  firstname: null,
  lastname: null,
  password: null,
  address: null,
  comment: null,  
})

const productService = new ProductService()

const init = async () => {
  const data = ref(null)
  const error = ref(null)

  await fetch(urls.listProfiles)
    .then((res) => res.json())
    .then((json) => {profiles.value = json})
    .catch((err) => (error.value = err))
}

onBeforeMount(() => {
    initFilters()
})

onMounted(() => {
    init()

    //productService.getProducts().then((data) => (profiles.value = data))
})

const openNew = () => {
    product.value = {}
    submitted.value = false
    productDialog.value = true
}

const hideDialog = () => {
    profileDialog.value = false
    submitted.value = false
}

const createProfile = () => {
  stateProfile.id = null
  stateProfile.firstname = null
  stateProfile.lastname = null
  stateProfile.password = null 
  stateProfile.phone = null
  stateProfile.email = null
  stateProfile.address = null
  stateProfile.comment = null

  console.log('profile-add',profile.value)
  createDialog.value = true
}

const showProfile = (item) => {
  profile.value = { ...item }
  
  stateProfile.id = item.id
  stateProfile.firstname = item.firstname
  stateProfile.lastname = item.lastname
  stateProfile.password = item.password  
  stateProfile.phone = item.phone
  stateProfile.email = item.email  
  stateProfile.address = item.address
  stateProfile.comment = item.comment

  console.log('profile',profile.value)
  showDialog.value = true
}

const updateProfile = async () => {
  submitted.value = true
  stateProfile.role = {
    code:'deliver'
  }
  const header = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(stateProfile)
  }
  
  await fetch(`${urls.listProfiles}${stateProfile.id}/`, header)
    .then((res) => res.json())
    .then((json) => {console.log('profile-update',json)})
    .catch((err) => (error.value = err))	
  //toast.add({ severity: 'success', summary: 'Successful', detail: 'profile Created', life: 3000 });
  //profileDialog.value = false
  showDialog.value = false
  profile.value = {}
}

const saveProfile = async () => {
  submitted.value = true
  stateProfile.role = {
    code:'deliver'
  }
  const header = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(stateProfile)
  }
  
  await fetch(urls.listProfiles, header)
    .then((res) => res.json())
    .then((json) => {console.log('profile',json)})
    .catch((err) => (error.value = err))	
  //toast.add({ severity: 'success', summary: 'Successful', detail: 'profile Created', life: 3000 });
  //profileDialog.value = false
  createDialog.value = false
  profile.value = {}
}

const editProfile = (item) => {
    profile.value = { ...item }
    console.log(profile)
    profileDialog.value = true
}

const confirmDelete = (item) => {
    profile.value = item
    deleteDialog.value = true
}

const deleteProfile = () => {
    profiles.value = profiles.value.filter((val) => val.id !== profile.value.id)
    deleteProfileDialog.value = false
    profile.value = {}
    toast.add({ severity: 'success', summary: 'Successful', detail: 'profile Deleted', life: 3000 })
}

const findIndexById = (id) => {
    let index = -1
    for (let i = 0; i < profiles.value.length; i++) {
        if (profiles.value[i].id === id) {
            index = i
            break;
        }
    }
    return index;
}

const createId = () => {
    let id = ''
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
}

const exportCSV = () => {
    dt.value.exportCSV()
}

const confirmDeleteSelected = () => {
    deleteProfilesDialog.value = true
}
const deleteSelectedProfiles = () => {
    profiles.value = profiles.value.filter((val) => !selectedProfiles.value.includes(val));
    deleteProfilesDialog.value = false;
    selectedProfiles.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'profiles Deleted', life: 3000 });
}

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Новый" icon="pi pi-plus" class="p-button-success mr-2" @click="createProfile" />
                            <Button label="Удалить" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProfiles || !selectedProfiles.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Импорт" chooseLabel="Импорт" class="mr-2 inline-block" />
                        <Button label="Скачать" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="profiles"
                    v-model:selection="selectedProfiles"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} profiles"
                    responsiveLayout="scroll"
					class="p-datatable-sm"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Управление курьерами</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Поищу..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="code" header="Код" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Код</span>
                            {{ slotProps.data.index }}
                        </template>
                    </Column>
                    <Column header="ФИО" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ФИО</span>
                            {{ slotProps.data.firstname }} {{ slotProps.data.lastname }}
                        </template>
                    </Column>
                    <Column field="phone" header="Телефон" :sortable="true" />
                    <Column field="email" header="Email" :sortable="true" />
                    <Column field="address" header="Адрес" :sortable="true" />

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" class="mr-2 my-btn-rnd" text raised rounded @click="showProfile(slotProps.data)" />						    
                            <Button icon="pi pi-pencil" class="p-button-success mr-2 my-btn-rnd" text raised rounded @click="editProfile(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-warning mt-2 my-btn-rnd" text raised rounded @click="confirmDeleteProfile(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="createDialog" :style="{ width: '450px' }" header="Новый профиль" :modal="true" class="p-fluid">
                    
			    <div class="formgrid grid">
				  <div class="field col">
				    <!--label for=""></label-->
				    <InputText id="name" v-model="stateProfile.firstname" type="text" class="p-input-sm mb-2" placeholder="Имя" style="padding:1rem;" />
				    <InputText id="name" v-model="stateProfile.phone" type="text" class="p-input-sm mb-1" placeholder="Телефон" style="padding:1rem;" />
                    <Password id="password" v-model="stateProfile.password" placeholder="Пароль" :toggleMask="true" class="w-full mb-2" inputClass="w-full" :inputStyle='inputStyle'></Password>
				  </div>
				  <div class="field col">
				    <!--label for=""></label-->
				    <InputText id="name" v-model="stateProfile.lastname" type="text" class="p-input-sm mb-2" placeholder="Фамилия" style="padding:1rem;" />
				    <InputText id="name" v-model="stateProfile.email" type="text" class="p-input-sm mb-1" placeholder="Email" style="padding:1rem;" />
				  </div>
			    </div>

                    <div class="field">
				    <InputText id="name" v-model="stateProfile.address" type="text" class="p-input-sm mb-1" placeholder="Адрес" style="padding:1rem;" />
                    </div>
                    <div class="field">
                        <label for="description">Примечание</label>
                        <Textarea id="description" v-model="stateProfile.description" required="true" rows="3" cols="20" />
                    </div>
                    <template #footer>
                        <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="createDialog = !createDialog" />
                        <Button label="Создать" icon="pi pi-check" class="p-button-text" @click="saveProfile" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="showDialog" :style="{ width: '450px' }" header="Просмотр профиля" :modal="true" class="p-fluid">
                    
			    <div class="formgrid grid">
				  <div class="field col">
				    <!--label for=""></label-->
				    <InputText id="name" v-model="stateProfile.firstname" type="text" class="p-input-sm mb-2" placeholder="Имя" style="padding:1rem;" />
				    <InputText id="name" v-model="stateProfile.phone" type="text" class="p-input-sm mb-1" placeholder="Телефон" style="padding:1rem;" />
				  </div>
				  <div class="field col">
				    <!--label for=""></label-->
				    <InputText id="name" v-model="stateProfile.lastname" type="text" class="p-input-sm mb-2" placeholder="Фамилия" style="padding:1rem;" />
				    <InputText id="name" v-model="stateProfile.email" type="text" class="p-input-sm mb-1" placeholder="Email" style="padding:1rem;" />
				  </div>
			    </div>

                    <div class="field">
				    <InputText id="name" v-model="stateProfile.address" type="text" class="p-input-sm mb-1" placeholder="Адрес" style="padding:1rem;" />
                    </div>
                    <div class="field">
                        <label for="description">Примечание</label>
                        <Textarea id="description" v-model="stateProfile.description" required="true" rows="3" cols="20" />
                    </div>

                    <template #footer>
                        <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="showDialog = !showDialog" />
                        <Button label="Сохранить" icon="pi pi-check" class="p-button-text" @click="updateProfile" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProfileDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="profile"
                            >Are you sure you want to delete <b>{{ profile.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProfileDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProfile" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProfilesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="profile">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProfilesDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProfiles" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '~/assets/demo/styles/badges.scss';
::v-deep(.my-btn-rnd){
  height: 2rem !important;
  width: 2rem;
}
</style>
<route lang="yaml">
meta:
  layout: default
</route>