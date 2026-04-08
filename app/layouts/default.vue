<template>
  <SidebarProvider>
    <ShellSidebar />
    <SidebarInset class="flex min-h-screen flex-col">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      </header>
      <main class="flex min-h-0 flex-1 flex-col p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
