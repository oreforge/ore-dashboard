<script setup lang="ts">
import type { ContainerState } from '@oreforge/sdk'
import { containerStateClass } from '~/utils/status-colors'

const props = defineProps<{ state: ContainerState }>()

const badgeClass = computed(() => containerStateClass(props.state))
</script>

<template>
  <Badge variant="outline" :class="badgeClass" class="text-[11px] font-medium">
    {{ state }}
  </Badge>
</template>
