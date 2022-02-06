<template>
  <div
    class="h-full w-full m-0 py-7 px-4"
    style="
      border-radius: 53px;
      background: linear-gradient(
        180deg,
        var(--surface-50) 38.9%,
        var(--surface-0)
      );
    "
  >
    <Toast />
    <div class="text-center mb-5">
      <img
        src="layout/images/avatar.png"
        alt="Image"
        height="50"
        class="mb-3"
      />
      <div class="text-900 text-3xl font-medium mb-3">Добро пожаловать!</div>
      <span class="text-600 font-medium">Войдите, чтобы продолжить</span>
    </div>

    <div class="w-full md:w-10 mx-auto">
      <label for="email1" class="block text-900 text-xl font-medium mb-2"
        >Email или логин</label
      >
      <InputText
        id="email1"
        v-model="login.username_or_email"
        type="text"
        class="w-full mb-3"
        placeholder="Email или логин"
        style="padding: 1rem"
      />

      <label for="password1" class="block text-900 font-medium text-xl mb-2"
        >Пароль</label
      >
      <Password
        id="password1"
        v-model="login.password"
        placeholder="Пароль"
        :toggleMask="true"
        class="w-full mb-3"
        inputClass="w-full"
        inputStyle="padding:1rem"
      ></Password>
      <Button @click="Login()" label="Войти" class="w-full p-3 text-xl mt-5"></Button>
    </div>
  </div>
</template>

<script>
export default {
  layout: "auth",
  data() {
    return {
      login: {
        username_or_email: '',
        password: ''
      }
    }
  },
  methods: {
    async Login() {
      try {
        let response = await this.$auth.loginWith('local', { data: this.login })
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>