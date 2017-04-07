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

		for i in range(k):
			a = MillerRabin.next_attempt(n, k, i)
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

	def next_attempt(n, k, i):
		min_value = 2
		max_value = n - 2
		if k >= max_value - min_value + 1:
			return min_value + i
		return random.randint(min_value, max_value)
