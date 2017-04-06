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

		# Para k > n - 3, no loop a seguir a variável 'i' atingirá valores
		# maiores que n - 4, tornando o valor de 'a' superior a 2 + (n - 4) =
		# n - 2, o que fica fora do intervalo de verificação do teste de
		# Miller-Rabin.
		if k == None or k > n - 3:
			k = n - 3

		for i in range(k):
			a = 2 + i
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
