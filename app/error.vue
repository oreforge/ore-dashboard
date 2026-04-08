<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()

useHead({ title: `${props.error.statusCode}` })

const handleClear = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background text-foreground">
    <div class="text-center">
      <h1 class="text-6xl font-bold tabular-nums">{{ error.statusCode }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ error.message }}</p>
      <Button class="mt-6" variant="outline" @click="handleClear">
        Back to dashboard
      </Button>
    </div>
  </div>
</template>
