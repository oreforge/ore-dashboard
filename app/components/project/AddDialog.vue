<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open', { default: false })

const url = ref('')
const name = ref('')
const submitting = ref(false)

const canSubmit = computed(() => !submitting.value && url.value.trim().length > 0)

const { add } = useProjects()

async function handleSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const result = await add(url.value.trim(), name.value.trim() || undefined)
    toast.success(`Project "${result.name}" added`)
    url.value = ''
    name.value = ''
    open.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to add project')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Project</DialogTitle>
        <DialogDescription>
          Clone a project from a Git repository.
        </DialogDescription>
      </DialogHeader>
      <form class="flex flex-col gap-4 pt-2" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="add-url" class="text-sm font-medium leading-none">
            Repository URL
          </label>
          <Input
            id="add-url"
            v-model="url"
            placeholder="https://github.com/org/repo.git"
            required
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="add-name" class="text-sm font-medium leading-none">
            Name
            <span class="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="add-name"
            v-model="name"
            placeholder="Auto-derived from repo name"
          />
        </div>
        <DialogFooter class="pt-2">
          <Button type="button" variant="outline" @click="open = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="!canSubmit">
            <Loader2Icon v-if="submitting" class="mr-1.5 size-4 animate-spin" />
            Add Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
