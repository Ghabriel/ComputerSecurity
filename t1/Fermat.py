import random

def next_attempt(n, k, i):
	min_value = 2
	max_value = n - 2
	if k >= max_value - min_value + 1:
		return min_value + i
	return random.randint(min_value, max_value)

class Fermat:
	def test(n, k = None):
		# Casos básicos de primalidade.
		if n == 2:
			return True
		if n < 3 or n % 2 == 0:
			return False

		# O tamanho do espaço de busca é n - 3, portanto k não pode
		# ultrapassar este valor.
		if k == None or k > n - 3:
			k = n - 3

		for i in range(k):
			a = next_attempt(n, k, i)
			x = pow(a, n - 1, n)
			if x != 1:
				return False
		return True
