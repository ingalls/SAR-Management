<template>
<div class="page page-center">
      <div class="container container-normal py-4">
        <div class="row align-items-center g-4">
          <div class="col-lg">
            <div class="container-tight">
              <div class="text-center mb-4">
                <a href="." class="navbar-brand navbar-brand-autodark"><img src="" alt="" height="36"></a>
              </div>
              <div class="card card-md">
                <div class="card-body">
                  <h2 class="h2 text-center mb-4">Login to your account</h2>
                  <form action="./" method="get" autocomplete="off" novalidate="">
                    <div class="mb-3">
                      <label class="form-label">Email address</label>
                      <input type="email" class="form-control" placeholder="your@email.com" autocomplete="off">
                    </div>
                    <div class="mb-2">
                      <label class="form-label">
                        Password
                        <span class="form-label-description">
                          <a href="./forgot-password.html">I forgot password</a>
                        </span>
                      </label>
                      <div class="input-group input-group-flat">
                        <input type="password" class="form-control" placeholder="Your password" autocomplete="off">
                        <span class="input-group-text">
                          <a href="#" class="link-secondary" data-bs-toggle="tooltip" aria-label="Show password" data-bs-original-title="Show password"><!-- Download SVG icon from http://tabler-icons.io/i/eye -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="2"></circle><path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7"></path></svg>
                          </a>
                        </span>
                      </div>
                    </div>
                    <div class="mb-2">
                      <label class="form-check">
                        <input type="checkbox" class="form-check-input">
                        <span class="form-check-label">Remember me on this device</span>
                      </label>
                    </div>
                    <div class="form-footer">
                      <button type="submit" class="btn btn-primary w-100">Sign in</button>
                    </div>
                  </form>
                </div>
              </div>
              <div class="text-center text-muted mt-3">
                Don't have account yet? <a href="./sign-up.html" tabindex="-1">Sign up</a>
              </div>
            </div>
          </div>
          <div class="col-lg d-none d-lg-block">
          </div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data: function() {
        return {
            err: false,
        }
    }
}
</script>
