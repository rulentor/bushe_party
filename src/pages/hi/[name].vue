<script setup lang="ts">
const props = defineProps<{ name: string }>()
const router = useRouter()
const user = useUserStore()
//const { t } = useI18n()

watchEffect(() => {
  user.setNewName(props.name)
})
</script>

<template>
  <div>

  </div>
</template>
