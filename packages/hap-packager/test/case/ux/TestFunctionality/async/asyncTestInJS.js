
async function bar () {
  return 'bar'
}

async function foo () {
  const ret1 = await bar()
  console.info('ret1: ', ret1)
}

foo()
