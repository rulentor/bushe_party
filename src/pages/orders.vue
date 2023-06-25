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
  listProfiles: `${import.meta.env.VITE_API_URL}/api/profile/`,
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

  await fetch(urls.listOrders)
    .then((res) => res.json())
    .then((json) => (console.log('data',json)))
    .catch((err) => (error.value = err))
}

onBeforeMount(() => {
    init()
    initFilters()
})

onMounted(() => {
    productService.getProducts().then((data) => (profiles.value = data))
})
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
const getStatuses = (name) => {
  let result = 'Неопределён'
  switch(name){
	case 'busy':
	result = 'Доставка'
	break;
	case 'overtime':
	result = 'Просрочен'
	break;	
	case 'done':
	result = 'Доставлен'
	break;
	case 'refuse':
	result = 'Отказ'
	break;
	case 'waiting':
	result = 'Отложен'
	break;
	
}                
    return result
}
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
  
  stateProfile.id = null
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

const saveProfile = () => {
    submitted.value = true;
    if (profile.value.name && profile.value.name.trim() && profile.value.price) {
        if (profile.value.id) {
            profile.value.inventoryStatus = profile.value.inventoryStatus.value ? profile.value.inventoryStatus.value : profile.value.inventoryStatus;
            profiles.value[findIndexById(profile.value.id)] = profile.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'profile Updated', life: 3000 });
        } else {
            profile.value.id = createId();
            profile.value.code = createId();
            profile.value.image = 'product-placeholder.svg';
            profile.value.inventoryStatus = profile.value.inventoryStatus ? profile.value.inventoryStatus.value : 'INSTOCK';
            profiles.value.push(profile.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'profile Created', life: 3000 });
        }
        profileDialog.value = false
        profile.value = {}
    }
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
                            <Button label="Новый" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
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
                            <h5 class="m-0">Управление заказами</h5>
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
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column header="ФИО" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ФИО</span>
                            {{ slotProps.data.firstname }} {{ slotProps.data.lastname }}
                        </template>
                    </Column>
                    <Column header="Карта" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Карта</span>
                            <img :src="'demo/images/icons/' + slotProps.data.map" :alt="slotProps.data.image" class="shadow-2" width="100" />
                        </template>
                    </Column>
                    <Column field="price" header="Сумма" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.price }}
                        </template>
                    </Column>
                    <Column field="category" header="Маршрут" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Маршрут</span>
                            {{ slotProps.data.route }} км.
                        </template>
                    </Column>
                    <Column field="rating" header="Рейтинг" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Рейтинг</span>
                            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" :stars="5"/>
                        </template>
                    </Column>
                    <Column field="status" header="Статус" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
						    {{ getStatuses(slotProps.data.status) }}

                            <!--span :class="'product-badge status-' + (slotProps.data.status ? slotProps.data.status.toLowerCase() : '')">{{ slotProps.data.status }}</span-->
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" class="mr-2 my-btn-rnd" text raised rounded @click="showProfile(slotProps.data)" />						    
                            <Button icon="pi pi-pencil" class="p-button-success mr-2 my-btn-rnd" text raised rounded @click="editProfile(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-warning mt-2 my-btn-rnd" text raised rounded @click="confirmDeleteProfile(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

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


                    <div class="field">
                        <label class="mb-3">Category</label>
                        <div class="formgrid grid">
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category1" name="category" value="Accessories" v-model="profile.category" />
                                <label for="category1">Accessories</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category2" name="category" value="Clothing" v-model="profile.category" />
                                <label for="category2">Clothing</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category3" name="category" value="Electronics" v-model="profile.category" />
                                <label for="category3">Electronics</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category4" name="category" value="Fitness" v-model="profile.category" />
                                <label for="category4">Fitness</label>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProfile" />
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