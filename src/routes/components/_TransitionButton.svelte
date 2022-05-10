<script lang="ts">
  export let title: string;
  export let reverseDir: boolean = false;
</script>

<button
  on:click
  class="w-48 {reverseDir
    ? 'bg-gradient-to-r rounded-r'
    : 'bg-gradient-to-l rounded-l'} from-blue-500 h-fit hover:bg-blue-700 duration-200 text-white font-bold px-1 py-4 text-sm"
>
  {title}
</button>
