<script lang="ts" setup>
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';

const {locale} = useI18n();
const selectedLanguage = ref(locale.value);

const languages = [
  {name: 'English', code: 'en'},
  {name: 'Tiếng Việt', code: 'vi'},
];

const switchLanguage = () => {
  locale.value = selectedLanguage.value;
};
</script>

<template>
  <div class="flex items-center gap-2">
    <Select
      id="language-switcher"
      v-model="selectedLanguage"
      :options="languages"
      option-label="name"
      option-value="code"
      @change="switchLanguage"
    />
  </div>
</template>
