<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a
            href="https://linkai.io"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            linkai.io
          </a>
        </li>
      </ul>
      <div class="copyright">
        &copy; {{ year }} linkai
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style></style>
