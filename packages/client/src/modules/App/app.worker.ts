const promise = new Promise((resolve, reject) => {
  return import(/* webpackChunkName: "app" */ './App').then(
    (response: any) => resolve({ default: response.App }),
    (error) => reject(error)
  )
})

onmessage = (event) => {
  if (event.data === 'LOAD') {
    console.log('Worker')
    // @ts-ignore
    // const app = import(/* webpackChunkName: "app" */ './App')
    // @ts-ignore
    // require(/* webpackChunkName: "app" */ './App')
    // new URL(/* webpackChunkName: "app" */ './App');

    // self.importScripts(/* webpackChunkName: "app" */ './App');

    // import(/* webpackChunkName: "app" */ './App')
    // new Promise((resolve, reject) => {
    //     return import(/* webpackChunkName: "app" */ './App').then(
    //         (response: any) => resolve({default: response.App}),
    //         error => reject(error)
    //     )
    // })
  }
}

export {}

// export const preload = () => {
//     import(/* webpackChunkName: "app" */ './App')
// }
