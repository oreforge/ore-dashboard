<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const name = computed(() => route.params.name as string)

const { remove } = useProjects()
const removing = ref(false)
const showConfirm = ref(false)

async function handleRemove() {
  removing.value = true
  try {
    await remove(name.value)
    toast.success(`Project "${name.value}" removed`)
    router.push('/')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to remove project')
  } finally {
    removing.value = false
    showConfirm.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
      <p class="mt-0.5 text-sm text-muted-foreground">{{ name }}</p>
    </div>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <div class="space-y-1">
          <CardTitle>Delete project</CardTitle>
          <CardDescription>
            Permanently delete this project and stop all running servers. This cannot be undone.
          </CardDescription>
        </div>
        <Button variant="destructive" size="sm" class="shrink-0" @click="showConfirm = true">
          Delete project
        </Button>
      </CardHeader>
    </Card>

    <Dialog v-model:open="showConfirm">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete
            <span class="font-semibold text-foreground">{{ name }}</span>
            and stop all running servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showConfirm = false">Cancel</Button>
          <Button variant="destructive" :disabled="removing" @click="handleRemove">
            <Loader2Icon v-if="removing" class="mr-1.5 size-4 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
