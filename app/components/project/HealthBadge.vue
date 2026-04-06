<script setup lang="ts">
import type { HealthState } from '@oreforge/sdk'
import { healthStateClass } from '~/utils/status-colors'

const props = defineProps<{ health: HealthState }>()

const badgeClass = computed(() => healthStateClass(props.health))
</script>

<template>
  <Badge variant="outline" :class="badgeClass" class="text-[11px] font-medium">
    {{ health }}
  </Badge>
</template>
