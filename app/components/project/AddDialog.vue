<script setup lang="ts">
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
      <form @submit.prevent="handleSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="add-url">Repository URL</FieldLabel>
            <Input
              id="add-url"
              v-model="url"
              placeholder="https://github.com/org/repo.git"
              required
            />
          </Field>
          <Field>
            <FieldLabel for="add-name">
              Name
              <span class="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="add-name"
              v-model="name"
              placeholder="Auto-derived from repo name"
            />
          </Field>
        </FieldGroup>
        <DialogFooter class="pt-6">
          <Button type="button" variant="outline" @click="open = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="!canSubmit">
            <Spinner v-if="submitting" class="mr-1.5" />
            Add Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
