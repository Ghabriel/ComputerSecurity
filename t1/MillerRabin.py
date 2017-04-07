import random

class MillerRabin:
	def test(n, k = None):
		# Casos básicos de primalidade.
		if n == 2:
			return True
		if n < 3 or n % 2 == 0:
			return False

		# Decompõe n - 1 na forma 2^r.d com d ímpar.
		prev = n - 1
		r = 0
		while prev % 2 == 0:
			prev >>= 1
			r += 1
		d = prev

		# O tamanho do espaço de busca é n - 3, portanto k não pode
		# ultrapassar este valor.
		if k == None or k > n - 3:
			k = n - 3

		# Espaço de busca total, do qual uma amostra será retirada.
		search_space = range(2, n - 1)

		# Uma amostra do espaço de busca que será efetivamente analisada
		# pelo algoritmo.
		sample = random.sample(search_space, k)

		for i in range(k):
			a = sample[i]
			x = pow(a, d, n)
			if x == 1 or x == n - 1:
				continue
			skip = False
			for j in range(r - 1):
				x = (x * x) % n
				if x == 1:
					return False
				if x == n - 1:
					skip = True
					break
			if skip:
				continue
			return False
		return True
