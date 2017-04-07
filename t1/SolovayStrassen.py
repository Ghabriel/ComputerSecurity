import random

# Computa um símbolo de Jacobi. 'n' deve ser ímpar.
def jacobi(a, n):
	j = 1
	while a != 0:
		while a % 2 == 0:
			a >>= 1
			mod = n % 8
			if mod == 3 or mod == 5:
				j = -j
		(a,n) = (n,a)
		if a % 4 == 3 and n % 4 == 3:
			j = -j
		a %= n
	if n == 1:
		return j
	return 0

class SolovayStrassen:
	def test(n, k = None):
		# Casos básicos de primalidade.
		if n == 2:
			return True
		if n < 3 or n % 2 == 0:
			return False

		# O tamanho do espaço de busca é n - 2, portanto k não pode
		# ultrapassar este valor.
		if k == None or k > n - 2:
			k = n - 2

		exponent = (n - 1) // 2
		for i in range(k):
			a = SolovayStrassen.next_attempt(n, k, i)
			x = jacobi(a, n)
			if x == 0 or pow(a, exponent, n) != x % n:
				return False
		return True

	def next_attempt(n, k, i):
		min_value = 2
		max_value = n - 1
		if k >= max_value - min_value + 1:
			return min_value + i
		return random.randint(min_value, max_value)
